<?php
/*
   NOTE-
   Google caches the result of the kml path presented it in a weird way (clearing browser cache doesn't seem to clear it). So, if it's 'not updating' when you edit it, that's why.
 */

require_once('../../config.class.php');
require_once('media.php');

$conn = mysql_pconnect(Config::dbHost, Config::dbUser, Config::dbPass);
mysql_select_db (Config::dbSchema);
$prefix = $_REQUEST['gameId'];
//$query = "SELECT {$prefix}_items.*, media.*, players.* FROM {$prefix}_items, media, players WHERE {$prefix}_items.media_id = media.media_id AND {$prefix}_items.creator_player_id = players.player_id";
$query = "SELECT m.note_id, m.user_name, m.content_id, m.title, m.file_path, game_locations.latitude, game_locations.longitude FROM 
(SELECT nc.note_id, nc.user_name, nc.content_id, nc.title, media.file_path FROM 
 (SELECT n.note_id, n.user_name, note_content.content_id, note_content.title, note_content.media_id FROM 
  (SELECT notes.note_id, players.user_name FROM notes LEFT JOIN players ON notes.owner_id = players.player_id WHERE game_id='{$prefix}')
  AS n LEFT JOIN note_content ON n.note_id = note_content.note_id)
 AS nc LEFT JOIN media ON nc.media_id = media.media_id)
AS m LEFT JOIN (SELECT * FROM locations WHERE game_id + {$prefix}) AS game_locations ON m.note_id = game_locations.type_id ORDER BY note_id ASC";
$result = @mysql_query($query);

if (mysql_error()) die ("<html><body>ERROR: Bad gameId- $query</body></html>");

// Creates an array of strings to hold the lines of the KML file.
$kml = array('<?xml version="1.0" encoding="UTF-8"?>');
$kml[] = '<kml xmlns="http://earth.google.com/kml/2.1">';
$kml[] = ' <Document>';

$row;
$nextRow = @mysql_fetch_assoc($result);
$count = 0;

while ($nextRow) 
{
    $mediaHtml = "";
    $kml[] = ' <Placemark id="placemark' . $count . '">';
    $kml[] = ' <name>' . htmlentities($nextRow['title']) . '</name>';
    $description = array("<![CDATA[");
    $description[] = "<strong>Created By:</strong> {$nextRow['user_name']}<br/>";
    do{
        $row = $nextRow;
        $mediaURL = Config::gamedataWWWPath . "/{$_REQUEST['gameId']}/{$row['file_path']}";

        $mediaObject = new Media;
        $type = $mediaObject->getMediaType($mediaURL);

        if ($type == Media::MEDIA_IMAGE) $mediaHtml .= "<a target='_blank' href='{$mediaURL}'><img width='20' src='$mediaURL'/></a>";
        else if ($type == Media::MEDIA_AUDIO) $mediaHtml .= "<a target='_blank' href='{$mediaURL}'>Link to Audio</a>"; 
        else if ($type == Media::MEDIA_VIDEO) $mediaHtml .= "<div style='margin-left: auto; margin-right:auto;'>
            <object height='175' width='212'>
                <param value='" . $mediaURL . "' name='movie'>
                <param value='transparent' name='wmode'>
                <embed wmode='transparent' type='application/x-shockwave-flash'
                src='".$mediaURL."' height='175'
                width='212'>
                </object>
                </div>";
        $mediaHtml.="<br />";
        if(!($nextRow = @mysql_fetch_assoc($result))) $nextRow = false; 
    } while($nextRow && $nextRow['note_id'] == $row['note_id']);
    //echo $mediaHtml;
    $description[] = $mediaHtml;
    //$description[] = "<strong>Date:</strong> {$row['origin_timestamp']}<br/>";
    //$description[] = '<p>' . $row['description'] . '</p>';
    $description[] = "]]>";
    $descriptionHtml = join("\n", $description);

    $kml[] = ' <description>' . $descriptionHtml . '</description>';
    $kml[] = ' <Point>';
    $kml[] = ' <coordinates>' . $row['longitude'] . ','  . $row['latitude'] . '</coordinates>';
    $kml[] = ' </Point>';
    $kml[] = ' </Placemark>';
    $count++;
} 

/*
   <![CDATA[<div style="font-size:larger">
   <div>
   <div style="width: 212px; font-size: 12px;">
   <b>The Spaghetti Film</b>
   </div>
   <div style="font-size: 11px;">
   <a target="_blank" href="http://www.youtube.com/?v=FICUvrVlyXc">
http://www.youtube.com/?v=FICUvrVlyXc</a><br>
</div><br>
<div style="margin-left: auto; margin-right:auto;">
<object height="175" width="212">
<param value="http://www.youtube.com/v/FICUvrVlyXc" name="movie">
<param value="transparent" name="wmode">
<embed wmode="transparent" type="application/x-shockwave-flash"
src="http://www.youtube.com/v/FICUvrVlyXc" height="175"
width="212">
</object>
</div>
</div>
</div>
<div style="font-size: smaller; margin-top: 1em;">Saved from 
<a href="http://maps.google.com/ig/add?synd=mpl&pid=mpl&moduleurl=
http:%2F%2Fwww.google.com%2Fig%2Fmodules%2Fmapplets-youtube.xml&hl=en&gl=us">
YouTubeVideos</a>
</div>
]]>
 */

// End KML file
$kml[] = ' </Document>';
$kml[] = '</kml>';
$kmlOutput = join("\n", $kml);

switch ($_REQUEST['type']) {
    case 'kml':
        header('Content-type: application/vnd.google-earth.kml+xml');
        header('Content-Disposition: attachment; filename="PlayerCollectedItems.kml"');
        echo $kmlOutput;
        break;
    case 'map':
        //echo $kmlOutput;
        $kmlPath = 'http://' . $_SERVER['SERVER_NAME'] . $_SERVER['PHP_SELF'] . '?type=kml&gameId=' . $_REQUEST['gameId'];
        //echo $kmlPath;
        include ('REST_GoogleMapWithKMLVariable.inc.php');
        break;
    default:
        echo 'Please add a "type" GET variable of "kml" or "map"';	
}
?>

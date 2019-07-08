<?php
error_reporting(0);

include "../config.php";

$FilePath = "config.json";

if (!file_exists($FilePath))
{
	$ConfigCreation = fopen($FilePath, "w");
	fclose($ConfigCreation);
}

$canwrite = is_writable("config.json"); //config.json must exists
$BackgroundPath = "../background/";
$MusicPath = "../musics/";
$BluredPrefix = "blur_";

function safepath($path)
{
  return trim($path, "/"); // remove any '/' to prevent unwanted file delete
}

function json_builder($success, $error, $data = "")
{
  $array = array('success' => $success, 'error' => intval($error), 'data' => $data);
  return json_encode($array);
}

function return_bytes($val)
{
    $val  = trim($val);

    if (is_numeric($val))
        return $val;

    $last = strtolower($val[strlen($val)-1]);
    $val  = substr($val, 0, -1); // necessary since PHP 7.1; otherwise optional

    switch($last) {
        // The 'G' modifier is available since PHP 5.1.0
        case 'g':
            $val *= 1024;
        case 'm':
            $val *= 1024;
        case 'k':
            $val *= 1024;
    }

    return $val;
}

function formatBackgroundPath($number, $prefix = "", $path = "../background/", $extension = ".jpg") {
  return $path.$prefix.strval($number).$extension;
}

function nextnumber($patho = "../background/", $extension = ".jpg")
{

  $number = 0;
  for($number;;$number++)
  {
    $path = formatBackgroundPath($number,null, $patho, $extension);
    if (file_exists($path) == false)
    {
      return $number;
      break;
    }
  }
}

function validjson($json)
{
  json_decode($json);
  if (json_last_error() === JSON_ERROR_NONE)
  {
    return true;
  }
  return false;
}

function base64_to_jpeg($base64_string, $output_file) {
    // open the output file for writing
    $ifp = fopen( $output_file, 'wb' );

    // split the string on commas
    // $data[ 0 ] == "data:image/png;base64"
    // $data[ 1 ] == <actual base64 string>
    $data = explode( ',', $base64_string );

    // we could add validation here with ensuring count( $data ) > 1
    $success = fwrite( $ifp, base64_decode( $data[ 1 ] ) );

    // clean up the file resource
    fclose( $ifp );

    return $success;
}

if (isset($_POST["type"]) && $_POST["type"] === "perms") //Check for permissions
{
  if ($canwrite)
  {
    echo 1; //Very bad code optimisation due to php
    exit();
  }
  echo 0;
  exit();
}

if (isset($_POST["cookie"]) && isset($_POST["type"])) //Check if cookie & type is defined
{

  if ($_POST["cookie"] != $Password)
  {
    echo json_builder(false, 10); // Bad cookie
    exit();
  }

  if (isset($_POST["json"]) && $_POST["type"] == "json") //Check for the json type
    {

    if (validjson($_POST["json"]))
    {
      if (file_put_contents($FilePath, $_POST["json"]) == true)
      {
        echo json_builder(true, 0);
        exit();
      }
      echo json_builder(false, 21); // Can't write
      exit();
    }
    echo json_builder(false, 20); //Json error
    exit();
  }

  if (isset($_FILES["image"]) && isset($_POST["blurredImage"]) && $_POST["type"] === "image") // Check for the image type
  {
      if ($_FILES["image"]["size"] === 0)
      {
        echo json_builder(false, 32); //Too big
        exit();
      }
      $lookforimage = getimagesize($_FILES["image"]["tmp_name"]);
      if ($lookforimage !== false)
      {
        $dest = nextnumber();
        $fullDest = formatBackgroundPath($dest);
        if(move_uploaded_file($_FILES["image"]["tmp_name"], $fullDest) && base64_to_jpeg($_POST["blurredImage"], formatBackgroundPath($dest, $BluredPrefix)) !== false)
        {
          echo json_builder(true, 0, $fullDest); //Echo the path success

        }
        else {
          echo json_builder(false, 31); // Can't save the image Permission error
        }
        exit();
      }
      else {
        echo json_builder(false, 30); //Bad image
        exit();
      }
  }

  if (isset($_FILES["music"]) && $_POST["type"] === "music") // Check for the music type
  {
    if ($_FILES["music"]["size"] === 0)
    {
      echo json_builder(false, 32); //Too big
      exit();
    }

		if (!is_dir($MusicPath))
		{
			if (!mkdir($MusicPath, 0775))
			{
				echo json_builder(false, 33); //Cant make folder
			}
		}

    $fullDest = $MusicPath.$_FILES["music"]["name"];
		$wat = move_uploaded_file($_FILES["music"]["tmp_name"], $fullDest);
		if($wat)
    {
      echo json_builder(true, 0, $fullDest); //Echo the path success
    }
    else {
      echo json_builder(false, 31); // Can't save the music Permission error
    }
    exit();
  }

  if(isset($_POST["id"]) && isset($_POST["image"]) && $_POST["type"] == "updateblur") //Update blurred background
  {
    $path = formatBackgroundPath($_POST["id"], $BluredPrefix);
    if (file_exists($path))
    {
      if (unlink($path) != true)
      {
        echo json_builder(false, 50); //Can't delete file
        exit();
      }
    }
    if (base64_to_jpeg($_POST["image"], formatBackgroundPath($_POST["id"], $BluredPrefix)) !== false)
    {
      echo json_builder(true, 0, $path); //echo path
      exit();
    }
    echo json_builder(false, 51, $path); //Can't convert the file; please note that the previous blured background is now gone
    exit();
  }

  if (isset($_POST["name"]) && $_POST["type"] === "deleteimage") //Delete a image
  {
    $path = safepath($_POST["name"]);
    $path = $BackgroundPath.$path;
    $blurredpath = $BackgroundPath.$BluredPrefix.$_POST["name"];
    if (!file_exists($path))
    {
      echo json_builder(false, 40); //File dosent exists
      exit();
    }
    else if (unlink($path))
    {
      if (!file_exists($blurredpath))
      {
        echo json_builder(true, 0, $path);
        exit();
      }
      if (unlink($blurredpath)) {
        echo json_builder(true, 0, $path);
        exit();
      }
      echo json_builder(true, 42, $path);
      exit();
    }
    else {
      echo json_builder(false, 41, $path); //Cant delete files
      exit();
    }
  }

  if (isset($_POST["name"]) && $_POST["type"] === "deletemusic")
  {
    $path = safepath($_POST["name"]);
    $path = $MusicPath.$path;
    if (!file_exists($path))
    {
      echo json_builder(false, 60);
      exit();
    }
    if (unlink($path)) {
      echo json_builder(true, 0, $path);
      exit();
    }
    echo json_builder(false, 61, $path);
    exit();
  }

  echo json_builder(false, 11);
  exit();
  //End of verification no type provided.
}

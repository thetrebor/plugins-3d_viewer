<?php
global $settings, $config;

$fileExtension = \FM::getExtension($fileName);

$vars = [
	'URLRoot' => $config['url']['root'],
	'pluginURL' => $this->url,
	'folderPath' => \FM::dirname($data['relativePath']),
	'filePath' => $data['relativePath'],
	'filePathOBJ' => \FM::replaceExtension($data['relativePath'], 'obj'),
	'downloadBaseURL' => $config['url']['root'].'/?module=custom_actions&action=3d_viewer&method=download',
	'fileExtension' => $fileExtension
];

?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
	<title><?php echo \S::safeHTML(\S::forHTML($fileName));?></title>
	<script src="<?php echo $this->url;?>/three/three.min.js?v=<?php echo $settings->currentVersion;?>"></script>

	<?php if ($fileExtension == 'mtl' || $fileExtension == 'obj') { ?>
	<script src="<?php echo $this->url;?>/three/loaders/OBJLoader.js?v=<?php echo $settings->currentVersion;?>"></script>
	<script src="<?php echo $this->url;?>/three/loaders/MTLLoader.js?v=<?php echo $settings->currentVersion;?>"></script>
	<script src="<?php echo $this->url;?>/three/loaders/DDSLoader.js?v=<?php echo $settings->currentVersion;?>"></script>
	<?php } ?>

	<?php if ($fileExtension == 'stl') { ?>
	<script src="<?php echo $this->url;?>/three/loaders/STLLoader.js?v=<?php echo $settings->currentVersion;?>"></script>
	<?php } ?>

	<?php if ($fileExtension == 'fbx') { ?>
	<script src="<?php echo $this->url;?>/three/loaders/FBXLoader.js?v=<?php echo $settings->currentVersion;?>"></script>
	<script src="<?php echo $this->url;?>/three/libs/inflate.min.js?v=<?php echo $settings->currentVersion;?>"></script>
	<script src="<?php echo $this->url;?>/three/curves/NURBSCurve.js?v=<?php echo $settings->currentVersion;?>"></script>
	<script src="<?php echo $this->url;?>/three/curves/NURBSUtils.js?v=<?php echo $settings->currentVersion;?>"></script>
	<?php } ?>

	<?php if ($fileExtension == 'dae') { ?>
	<script src="<?php echo $this->url;?>/three/loaders/ColladaLoader.js?v=<?php echo $settings->currentVersion;?>"></script>
	<?php } ?>

	<?php if ($fileExtension == 'x') { ?>
	<script src="<?php echo $this->url;?>/three/loaders/XLoader.js?v=<?php echo $settings->currentVersion;?>"></script>
	<?php } ?>

	<?php if ($fileExtension == 'gltf' || $fileExtension == 'glb') { ?>
	<script src="<?php echo $this->url;?>/three/loaders/GLTFLoader.js?v=<?php echo $settings->currentVersion;?>"></script>
	<script src="<?php echo $this->url;?>/three/loaders/DRACOLoader.js?v=<?php echo $settings->currentVersion;?>"></script>
	<?php } ?>

	<?php if ($fileExtension == '3ds') { ?>
	<script src="<?php echo $this->url;?>/three/loaders/TDSLoader.js?v=<?php echo $settings->currentVersion;?>"></script>
	<?php } ?>

	<script src="<?php echo $this->url;?>/three/controls/OrbitControls.js?v=<?php echo $settings->currentVersion;?>"></script>
	<script src="<?php echo $this->url;?>/app.js?v=<?php echo $settings->currentVersion;?>"></script>

	<script>
		App.vars = <?php echo json_encode($vars); ?>
	</script>
	<style>
		body {
			margin: 0;
			overflow: hidden;
		}
		canvas {
			width: 100%;
			height: 100%
		}
	</style>
</head>

<body onload="App.init()">
	<div id='loader' style='height:3px; width:100%; position: fixed; bottom: 0px; background-color:#f5f5f5;'>
		<div id='loader-bar' style='height:3px; width: 0%; background-color:#337ab7; text-align: center;color:white;font-size:1em;'></div>
	</div>
</body>
</html>
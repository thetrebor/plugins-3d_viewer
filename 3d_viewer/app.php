<?php

class custom_3d_viewer extends \FileRun\Files\Plugin {

	static $localeSection = "Custom Actions: 3D Viewer";
	static $publicMethods = ['download'];

	function init() {

		$this->JSconfig = [
			"title" => self::t("3D Viewer"),
			'iconCls' => 'fa fa-fw fa-dice-d6',
			'extensions' => ['obj', 'fbx', 'mtl', 'stl', 'dae', 'x'],
			"popup" => true,
			"requiredUserPerms" => ["download"],
			'requires' => ['download']
		];
	}

	function run() {
		$data = $this->prepareRead(['expect' => 'file']);
		$fileName = $data['alias'] ?: \FM::basename($data['fullPath']);
		require $this->path.'/display.php';
	}

	function download() {
		$this->downloadFile([
			'openInBrowser' => true,
			'logging' => ['details' => ['method' => '3D Viewer']]
		]);
	}
}
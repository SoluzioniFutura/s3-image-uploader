function s3ImageController(
	ImageService,
	ConfigService
) {
	var $ctrl = this;
	var loadingIndex = 0;
	$ctrl.fixedName = $ctrl.name || 's3-upload-modal';

	$ctrl.previewFile = function() {
		var reader = new FileReader();
		$ctrl.imagePreview = null;

		reader.onload = function(e) {
			$ctrl.imagePreview = e.target.result;
		};

		reader.readAsDataURL($ctrl.image);
	};

	$ctrl.resetImage = function() {
		$ctrl.image = null;
		$ctrl.imagePreview = null;
	};

	$ctrl.startUpload = function() {

		var index = loadingIndex;
		loadingIndex++;

		var newImage = {
			loading: true,
			index: index
		};

		$ctrl.images.unshift(newImage);

		ImageService.upload($ctrl.uploadImage).then(
			function(args) {

				var oldImage = $ctrl.images.filter(function(img) {
					return img.key === args.key;
				});

				if (oldImage.length === 0) {
					$ctrl.images = $ctrl.images.map(function (image) {
						return image.index === index ? args : image;
					});
				} else {
					$ctrl.images = $ctrl.images.reduce(function (prev, image) {
						if (image.key === args.key)
							prev.push(args);
						else if (image.index !== index)
							prev.push(image);

						return prev;
					}, []);
				}
			},
			function(err) {
				$ctrl.images = $ctrl.images.filter(function(image) {
					return image.index !== index;
				});
				ConfigService.get('defaultErrorHandler')(err);
			}
		);

		$ctrl.uploadImage = null;
	};

	$ctrl.select = function(key) {
		for (var i=0; i< $ctrl.images.length; i++)
			$ctrl.images[i].selected = $ctrl.images[i].key === key;

	};

	$ctrl.chose = function() {
		var selected = $ctrl.images.filter(function(i) { return i.selected; });
		if (selected.length === 0) {
			ConfigService.get('defaultErrorHandler')(new Error('Scegli almeno un\'immagine per proseguire.'));
		} else if (selected.length === 1) {
			$ctrl.image = selected[0].key;
			$('#' + $ctrl.fixedName).modal('hide');
		}
	};
	
	$ctrl.selectAndClose = function(key) {
		$ctrl.select(key);
		$ctrl.chose();
	};

	ImageService.getImages().then(
		function(images) {
			$ctrl.images = images;
		},
		ConfigService.get('defaultErrorHandler')
	);
	
	$ctrl.getThumbUrl = function(key) {
		return ConfigService.get('uploadsUrl') + '/' + key;
	};
	
	$ctrl.getResizedUrl = function(key) {
		return [
			ConfigService.get('uploadsUrl'),
			ConfigService.get('thumbPrefix'),
			key
		].join('/');
	};
}

angular.module('S3Image').component('s3image', {
	controller: s3ImageController,
	templateUrl: 'bower_components/s3-image-uploader/S3Image.html',
	bindings: {
		image: '=',
		name: '='
	}
});
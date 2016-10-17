function ImageService(
) {

	var entities = Restangular.all('S3');

	this.upload = function(file) {
		var d = $q.defer();
		
		if (! file.name.match(/\.(jpg|jpeg|png)$/))
			d.reject(new Error('Formato file non supportato'));
		else
			S3Service
				.upload(file)
				.then(
					function (res) {
						var key = res.key || res.Key;
						return resizeImage(key.replace('uploads/temp/', ''));
					},
					d.reject
				)
				.then(
					d.resolve,
					d.reject
				);
		

		return d.promise;
	};

	function resizeImage(key) {
		var d = $q.defer();

		$http({
			method: 'POST',
			url: ConfigService.get('apiUrl') + '/S3/resize?access_token=' + localStorage.accessToken,
			data: {
				key: key
			}
		})
			.then(
				function(obj) { d.resolve(obj.data.key); },
				d.reject
			);

		return d.promise;
	}

	
	this.getImages = function() {
		return entities.getList({where: {type: 'image'}});
	};

}

angular.module('S3Image', [
	'Global',
	'restangular'
]).service('ImageService', ImageService);
function ImageService(
	Restangular,
	S3Service,
	$q,
	ConfigService,
	$http
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
				function(obj) {
					var res = obj.data.key;
					res.url = [ConfigService.get('uploadsUrl'), res.key].join('/');
					res.thumbUrl = [
						ConfigService.get('uploadsUrl'),
						ConfigService.get('thumbPrefix'),
						res.key
					].join('/');
					d.resolve(res);
				},
				d.reject
			);
		
		return d.promise;
	}
	
	
	this.getImages = function() {
		return entities.getList({where: {type: 'image'}});
	};
	
	function replaceAssetsUrl(url) {
		var assetsUrl = ConfigService.get('assetsUrl');
		return assetsUrl + '/uploads/' + url.split('/uploads/')[1];
	}
	
}

angular.module('S3Image', [
	'Global',
	'restangular'
]).service('ImageService', ImageService);
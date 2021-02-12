/*
	制作拼图的json的文件
	示例为1024px*640px
	8*5
*/
//picture为图片的名字
//m为有几行,n为有几列,这里m为5,n为8
function makeJsonCan(picture,m,n,fun) {
	var img = new Image();
	img.src = picture;
	var timestamp = (new Date()).valueOf();
	var hide = timestamp%(m*n);
	img.onload = function() {
		var w = img.naturalWidth/n;//原始宽度,w为每块的宽度
		var h = img.naturalHeight/m;//原始高度,h为每块的高度
		var jsonCan = {};
		jsonCan.width = img.naturalWidth;
		jsonCan.height = img.naturalHeight;
		jsonCan.pic = [picture];
		jsonCan.img = [];
		var imgs = [];
		for(var i=0;i<m*n;i++) {
			imgs[i] = i;
		}
		imgs.sort(function(){
			return Math.random()-0.5;
		});
		for(var mn=0;mn<imgs.length;mn++) {
			var j = parseInt(imgs[mn]/n),i = parseInt(imgs[mn]%n);
			if(hide==mn) {
				jsonCan.img.push([0,img.naturalWidth,img.naturalHeight,w,h]);
			} else {
				jsonCan.img.push([0,w*i,h*j,w,h]);
			}
		}
		jsonCan.animation = [];
		//把动画放入动画列表
		for(var j=0;j<m;j++) {
			for(var i=0;i<n;i++) {
				if(i==0&&j==0) jsonCan.animation.push([0,j*8+i,w*i,h*j]);
				else jsonCan.animation.push([0,j*8+i,w*i,h*j]);
			}
		}
		jsonCan.playList = [];
		var list = [300000];
		for(var i=0;i<m*n;i++) {
			list.push(i);
		}
		jsonCan.playList.push(list);
		jsonCan.hide = hide;
		fun(jsonCan);
	}
};
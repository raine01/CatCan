//drFlaBirCha:drawFlappyBirdChannel
CatCanTool.drFlaBirCha = function(f,ps) {
	/*
		参数:
		1.通道y轴最大偏移值
		2.通道y轴最小偏移值
		3.通道x轴初始值
		4.移动速度(可选)
	*/
	if(ps.length<3) {
		console.error("Function 'drFlaBirCha' missing argument.");
		return;
	}
	var max=parseInt(ps[0]),min=parseInt(ps[1]),x0=parseInt(ps[2]),speed=parseInt(ps[3])||1;
	var domain=max-min;
	var fun = "if(this[2]<=0){var df=this.data["+f+"];this[2]="+x0+";var d=parseInt(Math.random()*"+domain+"+"+min+");df.push(d);this[3]=df.shift();}else{var df=this.data["+f+"];console.log(df[0]);this[2]-="+speed+";}";
	return {
		data: [min,max],
		flag: 0,
		fun: fun
	};
};
my=document.querySelector("video");
window.addEventListener('keydown', function(e) {
  if(e.keyCode == 32 && e.target == document.body) {
    e.preventDefault();
  }
});
my.loop = false;
my.autoplay = true;
my.onclick=function(){
	if(my.paused){
		my.play();
	}
	else
		my.pause();
}
whole=document.querySelector("body")
whole.onkeydown=function(e){
	if(e.keyCode === 39)
	{
		my.currentTime = my.currentTime + 5.00;
	}
	if(e.keyCode === 37)
	{
		my.currentTime = my.currentTime - 5.00;
	}
	if(e.keyCode === 38)
	{
		e.preventDefault();
		my.volume = my.volume + 0.10;
		if(my.muted === true)
			my.muted = false;
	}
	if(e.keyCode === 40)
	{
		e.preventDefault();
		my.volume = my.volume - 0.10;
		if(my.volume <= 0.00001)
			my.muted = true;
	}
	if(e.keyCode===32){
		if(my.paused){
			my.play();
		}
		else
			my.pause();
		}

}

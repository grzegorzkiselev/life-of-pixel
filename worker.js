(()=>{var m=(r,a,e,t)=>function(i){for(var l=0,o=0,d=0;l<r&&o<e;l+1===r?(l=0,o++,d+=r):l++)i({cells:this,currentIndex:l+d,i:l,j:o,widthNum:r,heightNum:e,cellWidth:a,cellHeight:t})},s=r=>{for(var a=[...r],e=r.length;e--;){var t=Math.floor(Math.random()*(e+1));[a[e],a[t]]=[a[t],a[e]]}return a};var u=null,p=null,n={empty:0,alive:16,dead:15,aliveNext:8,deadNext:23,n:7,dropN:24},f=0,R=s(["#f0ba00","#de8790","#6b1f1c","#333c7d","#367148","#91b9d6","#aa2404"]).slice(0,3),c=Date.now(),M=4,N=1e3/M,h=0,D=(r,a,e)=>{f=Number(e);var t=f,v=f,i=r/t,l=a/v,o=f/r;return{widthNum:t,cellWidth:i,heightNum:v,cellHeight:l,sideDivider:o}},S=(r,a,e)=>{var t=a*(e*4)+r*4;return[t,t+1,t+2,t+3]},U=(r,a,e,t,v,i)=>{var l=0,o=0,d=new Uint8Array(Array.from({length:a*t},()=>(l+1===a?(l=0,o++):l++,r[S(Math.floor(l/i),Math.floor(o/i),e)[0]]<129?n.alive:n.empty)));return d},q=({cells:r,currentIndex:a,i:e,j:t,widthNum:v,heightNum:i})=>{var l=r[a],o=0;e-1>0&&r[a-1]&n.alive&&o++,e+1<v&&r[a+1]&n.alive&&o++,t-1>0&&r[a-v]&n.alive&&o++,t+1<i&&r[a+v]&n.alive&&o++,r[a]=(o===1||o===3?l|n.aliveNext:l&n.deadNext)|o},z=({currentIndex:r,cells:a,cellWidth:e,cellHeight:t,i:v,j:i})=>{var l=a[r];l&n.alive&&(p.fillStyle=R[(l&n.n)-1],p.fillRect(v*e,i*t,e,t)),a[r]=l&n.aliveNext?(l|n.alive)&n.dropN:n.empty},y=(r,a,e)=>{var t=Date.now();t-c>=N&&(r.wrappedForEach(q),p.clearRect(0,0,a,e),r.wrappedForEach(z),c=t),h=requestAnimationFrame(y.bind(null,r,a,e))},B=(r,a,e)=>{r.width=a,r.height=e},G=(r,a,e,t)=>{h>0&&cancelAnimationFrame(h),B(u,a,e);var{widthNum:v,cellWidth:i,heightNum:l,cellHeight:o,sideDivider:d}=D(a,e,t),F=Math.max(r.width,r.height),b=a/F,w=r.width*b,C=r.height*b,A=(a-w)/2,g=(e-C)/2;p.drawImage(r,A,g,r.width*b,r.height*b);var E=p.getImageData(0,0,a,e).data;p.clearRect(0,0,a,e),p.fillStyle="#f00";var x=m(v,i,l,o),k=U(E,v,a,l,e,d);Uint8Array.prototype.wrappedForEach=x,y(k,a,e)};addEventListener("message",r=>{var{canvas:a,image:e,canvasWidth:t,canvasHeight:v,resolution:i}=r.data;switch(r.data.message){case"initCanvas":u=a,p=u.getContext("2d");break;case"processFirstFrame":G(e,t,v,i);break}});})();
//# sourceMappingURL=worker.js.map
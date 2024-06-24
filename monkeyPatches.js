(()=>{var b=(r,p,e,o)=>function(h){for(var n=0,c=0,u=0;n<r&&c<e;n+1===r?(n=0,c++,u+=r):n++)h({cells:this,currentIndex:n+u,i:n,j:c,widthNum:r,heightNum:e,cellWidth:p,cellHeight:o})},f=(r,p=0,e=r.length-1)=>{for(var o=[];e-->=p;){let t=Math.floor(Math.random()*(e+1));[r[e],r[t]]=[r[t],r[e]],o.push(r[e])}return o};})();
//# sourceMappingURL=monkeyPatches.js.map

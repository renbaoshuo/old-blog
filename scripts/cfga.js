(function(t,e,n){const a=t.screen;const o=encodeURIComponent;const r=Math.max;const i=t.performance;const s="getEntriesByType"in i&&"getEntriesByName"in i;const c=t=>isNaN(t)||t==Infinity||t<0?void 0:t;const d=t=>Math.random().toString(36).slice(-t);const g=t=>Math.ceil(Math.random()*(t-1))+1;const l=t=>i.getEntriesByName(t);const m=t=>i.getEntriesByType(t);const p=n=>{(function(t,e,n,a,o){t["GoogleAnalyticsObject"]=o;t[o]=t[o]||function(){(t[o].q=t[o].q||[]).push(arguments)};t[o].l=1*new Date;var r=e.createElement(n);first_element=e.getElementsByTagName(n)[0];r.async=true;r.src=a;first_element.parentNode.insertBefore(r,first_element)})(t,e,"script","https://www.google-analytics.com/analytics.js","ga");ga("create",n,"auto");ga("send","pageview")};const u=s?m("navigation")[0]:i.timing;const h=s?u.startTime:u.navigationStart;function f(){var i=[d(g(4))+"="+d(g(6)),"ga="+t.ga_tid,"dt="+o(e.title),"de="+o(e.characterSet||e.charset),"dr="+o(e.referrer),"ul="+(n.language||n.browserLanguage||n.userLanguage),"sd="+a.colorDepth+"-bit","sr="+a.width+"x"+a.height,"vp="+r(e.documentElement.clientWidth,t.innerWidth||0)+"x"+r(e.documentElement.clientHeight,t.innerHeight||0),"plt="+c(u.loadEventStart-h||0),"dns="+c(u.domainLookupEnd-u.domainLookupStart||0),"pdt="+c(u.responseEnd-u.responseStart||0),"rrt="+c(u.redirectEnd-u.redirectStart||0),"tcp="+c(u.connectEnd-u.connectStart||0),"srt="+c(u.responseStart-u.requestStart||0),"dit="+c(u.domInteractive-u.domLoading||0),"clt="+c(u.domContentLoadedEventStart-h||0),"z="+Date.now()];if(s){i.push("fp="+c(l("first-paint")[0].startTime||0));i.push("fcp="+c(l("first-contentful-paint")[0].startTime||0))}fetch(`${t.ga_api}?${i.join("&")}`).catch((e=>{p(t.ga_tid,{mode:"cors"});console.error("Failed to Connect Baoshuo's Google Analytics API:\n",e)}))}t.cfga=f;if(e.readyState==="complete"){f()}else{t.addEventListener("load",f)}})(window,document,navigator);
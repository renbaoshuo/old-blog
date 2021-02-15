function loadFriends() {
    fetch(`${friends_endpoint}/links.json`)
        .then(response => response.json())
        .catch((error) => {
            document.getElementById('friends').innerHTML = `<p>加载失败，请 <a href="javascript:loadFriends();">刷新</a> 重试</p>`;
            console.log(error);
        })
        .then(friends => {
            let element = document.getElementById('friends');
            friends.forEach((friend) => {
                element.innerHTML += `<div class="friend-box">`
                    + `<a href="${friend.link}" target="_blank" rel="noopener nofollow">`
                    + `<img class="friend-avatar" src="${friends_endpoint}/img/${friend.logo}" loading="lazy">`
                    + `</a>`
                    + `<div class="friend-info">`
                    + `<a class="friend-info-title" href="${friend.link}" target="_blank" rel="noopener nofollow">`
                    + friend.name
                    + `</a>`
                    + `<br>`
                    + `<div class="friend-info-description">`
                    + friend.slogan
                    + `</div>`;
            });
            console.log('Friends list:', friends);
        });
}
setTimeout(loadFriends, 0);

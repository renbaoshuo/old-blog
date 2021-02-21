/**
 * @name Friends.JS
 * @author Ren Baoshuo <i@baoshuo.ren>
 * @description Friends Loading Script for Baoshuo's Blog
 */

const loadFriends = () => {
    fetch(`${friends_endpoint}/links.json`)
        .then(response => response.json())
        .then(friends => {
            let resultHTML = '';
            friends.forEach((friend) => {
                resultHTML += `<div class="friends-list-item">`
                    + `<a href="${friend.link}" target="_blank" rel="noopener nofollow">`
                    + `<img class="logo" src="${friends_endpoint}/img/${friend.logo}" loading="lazy">`
                    + `</a>`
                    + `<div class="info">`
                    + `<a class="title" href="${friend.link}" target="_blank" rel="noopener nofollow">`
                    + friend.name
                    + `</a>`
                    + `<br>`
                    + `<div class="description">`
                    + friend.slogan
                    + `</div>`
                    + `</div>`
                    + `</div>`;
            });
            document.getElementById('friends').innerHTML = resultHTML;
            console.log('Friends list:', friends);
        })
        .catch((error) => {
            document.getElementById('friends').innerHTML = `<p>加载失败，请尝试 <a href="javascript:loadFriends();">重新加载</a> 。</p>`;
            console.log(error);
        });
}

loadFriends();

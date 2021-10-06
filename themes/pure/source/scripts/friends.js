/**
 * @name Friends.JS
 * @author Ren Baoshuo <i@baoshuo.ren>
 * @description Friends Loading Script for Baoshuo's Blog
 */

const loadFriends = () => {
    fetch(`${friends_endpoint}/links.json`)
        .then((response) => response.json())
        .then((friends) => {
            let resultHTML = '';
            friends.forEach((friend) => {
                resultHTML +=
                    `<a href="${friend.link}" class="friend card flex" target="_blank" rel="noopener nofollow">` +
                    `<img class="friend-logo" src="${friends_endpoint}/img/${friend.logo}" loading="lazy">` +
                    `<div class="friend-info">` +
                    `<div class="friend-title" href="${friend.link}" target="_blank" rel="noopener nofollow">${friend.name}</div>` +
                    (friend.slogan && `<span class="friend-description">${friend.slogan}</span>`) +
                    `</div>` +
                    `</div>`;
            });
            document.getElementById('friends').innerHTML = resultHTML;
            // console.log('Friends list:', friends);
        })
        .catch((error) => {
            document.getElementById(
                'friends'
            ).innerHTML = `<p>加载失败，请尝试 <a href="javascript:loadFriends();">重新加载</a> 。</p>`;
            console.log(error);
        });
};

loadFriends();

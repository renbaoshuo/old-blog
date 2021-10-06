// TOC
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toc-btn').onclick = () => {
        document.getElementById('post-toc').classList.add('active');
    };
    document.getElementById('post-toc-close').onclick = () => {
        document.getElementById('post-toc').classList.remove('active');
    };
    Array.from(document.getElementsByClassName('toc-link')).forEach((element) => {
        element.addEventListener('click', () => {
            document.getElementById('post-toc').classList.remove('active');
        });
    });
});

if (typeof updateTime !== 'undefined') {
    var updated = Math.floor((new Date().getTime() - updateTime) / 864e5);
    if (updated > 182) {
        document.getElementById('article-expire-day').textContent = updated;
        document.getElementById('article-expire').classList.remove('hidden');
    }
}

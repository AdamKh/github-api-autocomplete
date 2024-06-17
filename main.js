
function createElem(tagName = 'div', classList = [], inner = '') {
    const element = document.createElement(tagName);
    if (classList.length > 0) {
        element.classList.add(...classList);
    }
    element.insertAdjacentHTML('afterbegin', inner);
    return element;
}

function createListItem(name, owner, stars) {
    let inner = `
    <div class='repos-list__info'>
        <p>Name: ${name}</p>
        <p>Owner: ${owner}</p>
        <p>Stars: ${stars}</p>
    </div>
    <div class='repos-list__delete'></div>
    `;
    
    return createElem('li', ['repos-list__item'], inner)
}

function clearElementContent(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

const debounce = (fn, ms) => {
    let timeout;
    return function() {
        const fnCall = () => { fn.apply(this, arguments) };
        clearTimeout(timeout);
        timeout = setTimeout(fnCall, ms);
    }
}

let firstFiveRepo = [];
function onChange(e) {
    let repoName = e.target.value;
    autocomplit.insertAdjacentHTML('afterbegin', '');
    if (repoName) {
        const url = `https://api.github.com/search/repositories?q=${repoName}&per_page=5`;

        fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data.items)){
                    firstFiveRepo = data.items;
                    let autocomplitData = '';
                    firstFiveRepo.forEach(repos => {
                        let autocomplistItem = createElem('div', ['dropdown__item'], repos.name);
                        autocomplitData += autocomplistItem.outerHTML;
                    });
                    clearElementContent(autocomplit);
                    autocomplit.insertAdjacentHTML('afterbegin', autocomplitData);

                    autocomplit.classList.remove('hidden');
                    autocomplit.classList.add('visible');
                }
            }).catch(err => console.error(err))
    } else {
        autocomplit.classList.remove('visible');
        autocomplit.classList.add('hidden');
    }
}

const autocomplit = document.querySelector('.dropdown');
autocomplit.addEventListener('click', function(e) {
    if (e.target && e.target.matches('.dropdown__item')) {
        const reposName = e.target.textContent;
        let matchedRepo = firstFiveRepo.find(repo => repo.name === reposName);
        searchBar.value = '';

        clearElementContent(autocomplit);
        let reposListItem = createListItem(matchedRepo.name, matchedRepo.owner.login, matchedRepo.stargazers_count);
        reposList.appendChild(reposListItem);

        autocomplit.classList.remove('visible');
        autocomplit.classList.add('hidden');
    }
});

onChange = debounce(onChange, 500)

const searchBar = document.querySelector('.search');
const reposList = document.querySelector('.repos-list');
reposList.addEventListener('click', e => {
    const btn = e.target.closest('.repos-list__delete');
    if (!btn) {
      return;
    }
    btn.closest('li').remove();
})

searchBar.addEventListener('input', onChange)

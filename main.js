
function createElem(tagName = 'div', classList = [], inner = '') {
    const element = document.createElement(tagName);
    if (classList.length > 0) {
        element.classList.add(...classList);
    }
    element.innerHTML = inner;
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

const debounce = (fn, ms) => {
    let timeout;
    return function() {
        const fnCall = () => { fn.apply(this, arguments) };
        clearTimeout(timeout);
        timeout = setTimeout(fnCall, ms);
    }
}

function onChange(e) {
    let repoName = e.target.value;
    const autocomplit = document.querySelector('.dropdown');
    autocomplit.innerHTML = '';
    if (repoName) {
        const url = `https://api.github.com/search/repositories?q=${repoName}`;
    
        fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data.items)){
                    let firstFiveRepo = data.items.slice(0, 5);
                    let autocomplitData = '';
                    firstFiveRepo.slice(0, 5).forEach(repos => {
                        let item = createElem('div', ['dropdown__item'], repos.name);
                        autocomplitData += item.outerHTML;
                    });

                    autocomplit.innerHTML = autocomplitData;

                    document.querySelectorAll('.dropdown__item').forEach(item => {
                        item.addEventListener('click', (e) => {
                            let reposName = e.target.textContent;
                            let matchedRepo = firstFiveRepo.find(repo => repo.name === reposName);
                            searchBar.value = '';
                            autocomplit.innerHTML = '';
                            let reposListItem = createListItem(matchedRepo.name, matchedRepo.owner.login, matchedRepo.stargazers_count);
                            reposList.appendChild(reposListItem);
                        });
                    });
                    autocomplit.style.display = 'block';
                }
            }).catch(err => console.error(err))
    } else {
        autocomplit.style.display = 'none';
    }
}

onChange = debounce(onChange, 500)



const searchBar = document.querySelector('.search');
const reposList = document.querySelector('.repos-list');
reposList.onclick = function(e) {
    const btn = e.target.closest('.repos-list__delete');
    if (!btn) {
      return;
    }
    btn.closest('li').remove();
}

searchBar.addEventListener('keyup', onChange)

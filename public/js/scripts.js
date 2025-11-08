// Event listeners
let authorLinks = document.querySelectorAll(".authors");
for (let authorLink of authorLinks) {
    authorLink.addEventListener("click", getAuthorInfo);
}

async function getAuthorInfo() {

    var myModal = new bootstrap.Modal(document.getElementById('authorModal'));
    myModal.show();


    let authorId = this.id;


    let url = `/api/authors/${authorId}`;
    let response = await fetch(url);
    let data = await response.json();


    let author = data[0];

    let box = document.querySelector("#authorInfo");
    box.innerHTML = `
        <h3>${author.firstName} ${author.lastName}</h3>
        <img src="${author.portrait}" class="img-fluid mb-3" style="max-width:150px;">
        <p><strong>DOB:</strong> ${author.dob}</p>
        <p><strong>DOD:</strong> ${author.dod}</p>
        <p><strong>Bio:</strong> ${author.bio}</p>
    `;
}
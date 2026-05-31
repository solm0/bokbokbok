const pile = document.getElementById("pile");
const shopGrid = document.getElementById("shopGrid");
const selectedImg = document.getElementById("selectedImg");
const selectedLabel = document.getElementById("selectedLabel");
const selectedTitle = document.getElementById("selectedTitle");
const selectedDesc = document.getElementById("selectedDesc");
const selectedPrice = document.getElementById("selectedPrice");
const addCartBtn = document.getElementById("addCartBtn");

const books = [
  {
    id: 1,
    title: "Issue 1",
    label: "BOK 001",
    price: "₩15,000",
    img: "https://via.placeholder.com/300x400/111111/ffffff?text=BOK+1",
    desc: "A compact zine for quiet rooms, small notes, and personal collections."
  },
  {
    id: 2,
    title: "Issue 2",
    label: "BOK 002",
    price: "₩18,000",
    img: "https://via.placeholder.com/300x400/484848/ffffff?text=BOK+2",
    desc: "A visual issue with interviews, fragments, and soft everyday scenes."
  },
  {
    id: 3,
    title: "BOK No. 3",
    label: "BOK 003",
    price: "₩20,000",
    img: "images/bok.png",
    desc: "The newest object in the pile, made to be found before it is sorted."
  },
  {
    id: 4,
    title: "Field Notes",
    label: "NOTE 004",
    price: "₩12,000",
    img: "https://via.placeholder.com/300x400/d7d2c1/111111?text=NOTE",
    desc: "Small pages for browsing, folding, carrying, and returning to later."
  }
];

let selectedBook = books[0];

function selectBook(book) {
  selectedBook = book;
  selectedImg.src = book.img;
  selectedImg.alt = book.title;
  selectedLabel.innerText = book.label;
  selectedTitle.innerText = book.title;
  selectedDesc.innerText = book.desc;
  selectedPrice.innerText = book.price;

  document.querySelectorAll("[data-book-id]").forEach((item) => {
    item.classList.toggle("selected", Number(item.dataset.bookId) === book.id);
  });
}

function createShelfBook(book) {
  const item = document.createElement("button");
  item.className = "shelf-book";
  item.type = "button";
  item.dataset.bookId = book.id;
  item.innerHTML = `
    <span class="shelf-cover" style="background-image:url('${book.img}')"></span>
    <span>${book.title}</span>
  `;
  item.onclick = () => selectBook(book);
  shopGrid.appendChild(item);
}

function createPileBook(index) {
  const book = books[index % books.length];
  const item = document.createElement("button");
  item.className = "pile-book";
  item.type = "button";
  item.dataset.bookId = book.id;
  item.style.left = `${8 + Math.random() * 74}%`;
  item.style.top = `${8 + Math.random() * 76}%`;
  item.style.transform = `rotate(${Math.random() * 68 - 34}deg)`;
  item.style.zIndex = index;
  item.style.backgroundImage = `url('${book.img}')`;
  item.onclick = () => selectBook(book);
  pile.appendChild(item);
}

books.forEach(createShelfBook);

for (let i = 0; i < 42; i += 1) {
  createPileBook(i);
}

addCartBtn.onclick = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(selectedBook);
  localStorage.setItem("cart", JSON.stringify(cart));
  addCartBtn.innerText = "Added";
  setTimeout(() => {
    addCartBtn.innerText = "Add to Cart";
  }, 900);
};

selectBook(selectedBook);

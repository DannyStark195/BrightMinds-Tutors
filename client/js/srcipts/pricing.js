import { formatCurrency } from "../utils/formatCurrency.js";
const toggleHrsBtn = document.querySelectorAll('.toggle-btn');
const toggle2HrsBtn = document.querySelector('.toggle-2hrs');
const toggle4HrsBtn = document.querySelector('.toggle-4hrs');
const toggleSlide = document.querySelector('.toggle-slide');
const priceCards = document.querySelector('.price-cards');

const comparisonTable = document.querySelector('.comparison-table-container');
const prices = [{
            "id": 1,
            "title": "Light",
            "price": {
                "2hrs": 8000,
                "4hrs": 15000,
            },
            "times-per-week": "2x per week",
            "sessions-per-week": "8 sessions per month"
        },
        {
            "id": 2,
            "title": "Standard",
            "price": {
                "2hrs": 12000,
                "4hrs": 20000,
            },
            "times-per-week": "3x per week",
            "sessions-per-week": "12 sessions per month"
        },
        {
            "id": 3,
            "title": "Intensive",
            "price": {
                "2hrs": 18000,
                "4hrs": 30000,
            },
            "times-per-week": "5x per week",
            "sessions-per-week": "20 sessions per month"
        }
    ]

function renderPriceCards(time){
    toggleHrsBtn.forEach(btn => btn.classList.remove('active'))
    let html = "";
    prices.forEach(priceCard =>{
        html += `
            <div class="price-card">
                <h3 class="price-title">${priceCard.title}</h3>
                <p class="price">₦${time === 2? formatCurrency(priceCard.price["2hrs"]):  formatCurrency(priceCard.price["4hrs"])}<small>/month</small></p>
                <ul class="why-choose-us">
                        <li class="prop">
                            <i class="fa-solid fa-check"></i>
                            ${priceCard["times-per-week"]}
                        </li>
                        <li class="prop">
                            <i class="fa-solid fa-check"></i>
                            ${priceCard["sessions-per-week"]}
                        </li>
                        <li class="prop">
                            <i class="fa-solid fa-check"></i>
                            Qualified vetted tutor
                        </li>
                        <li class="prop">
                            <i class="fa-solid fa-check"></i>
                            Physical or online sessions
                        </li>
                        <li class="prop">
                            <i class="fa-solid fa-check"></i>
                            Flexible scheduling
                        </li>
                        <li class="prop">
                            <i class="fa-solid fa-check"></i>
                            Progress updates to parent
                        </li>
                        <li class="prop">
                            <i class="fa-solid fa-check"></i>
                            WhatsApp support
                        </li>
                        ${priceCard.title === 'Intensive'? `<li class="prop">
                                                <i class="fa-solid fa-check"></i>
                                                Group sessions
                                            </li>`:''}
                </ul>
            </div>
        `
    });
    priceCards.innerHTML = html;

}
// function renderCompariosnTable(){
//     let html = "";
//     prices.forEach(tableData =>{
//         html += `
//            <table>
//                 <thead>
//                     <tr>
//                         <th></th>
//                         <th>${tableData}</th>
//                         <th>Standard</th>
//                         <th>Intensive</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     <tr>
//                         <td>Sessions per week</td>
//                         <td>2x</td>
//                         <td>3x</td>
//                         <td>5x</td>
//                     </tr>
//                     <tr>
//                         <td>Sessions per month</td>
//                         <td>8</td>
//                         <td>12</td>
//                         <td>20</td>
//                     </tr>
//                     <tr>
//                         <td>1hr price</td>
//                         <td>₦8,000</td>
//                         <td>₦12,000</td>
//                         <td>₦18,000</td>
//                     </tr>
//                     <tr>
//                         <td>2hr price</td>
//                         <td>₦15,000</td>
//                         <td>₦22,000</td>
//                         <td>₦32,000</td>
//                     </tr>
//                     <tr>
//                         <td>Physical sessions</td>
//                         <td>                                        
//                             <i class="fa-solid fa-check"></i>
//                         </td>
//                         <td>                                        
//                             <i class="fa-solid fa-check"></i>
//                         </td>
//                         <td>                                        
//                             <i class="fa-solid fa-check"></i>
//                         </td>
//                     </tr>
//                     <tr>
//                         <td>Online sessions</td>
//                         <td>                                        
//                             <i class="fa-solid fa-check"></i>
//                         </td>
//                         <td>                                        
//                             <i class="fa-solid fa-check"></i>
//                         </td>
//                         <td>                                        
//                             <i class="fa-solid fa-check"></i>
//                         </td>
//                     </tr>
//                 </tbody>
//             </table> 
//         `
//     })
// }
toggle2HrsBtn.addEventListener('click', () =>{
    toggleSlide.style.right = '50%';
    toggleSlide.style.left = '5%';
    toggle2HrsBtn.classList.add('active')
    renderPriceCards(2);
});

toggle4HrsBtn.addEventListener('click', () =>{
    toggleSlide.style.right = '5%';
    toggleSlide.style.left = '50%';
    toggle4HrsBtn.classList.add('active')
    renderPriceCards(4);
});

renderPriceCards(2);
document.addEventListener('DOMContentLoaded', function () {
    // Define the text for each tab.
    const tabText = {
        "Mission": "At CuntoWadaag , our mission is to simplify cooking by providing accessible and reliable recipe data. We empower individuals—especially young home cooks—to effortlessly recreate restaurant-quality dishes in their own kitchens, transforming everyday meals into gourmet experiences.",
        "Vision": "At CuntoWadaag , our vision is to empower both ourselves and others to continuously enhance our cooking skills. We aim to cultivate a supportive community where every recipe is a step towards greater culinary mastery, encouraging creativity, confidence, and a shared passion for the art of cooking.",
        "Our Value": "At CuntoWadaag , we are committed to quality foods—curating only the finest recipes that bring exceptional taste and nutritional value to your table. Our dedication to culinary excellence has not only enriched the cooking experiences of our community but has also established CuntoWadaag  as a premium platform with an estimated market value of 1 billion USD."
    };


    



    // Get all tab elements and the description element.
    const tabs = document.querySelectorAll('.goals .mission');
    const goalDescription = document.querySelector('.goal-description h2');

    // Set all tabs to grey initially.
    tabs.forEach(tab => {
        tab.style.backgroundColor = '#E5E4E2';
    });

    // Default select the first tab (assumed to be Mission).
    if (tabs.length > 0) {
        tabs[0].style.backgroundColor = '#c4a700';
        const defaultTitle = tabs[0].querySelector('h3').textContent.trim();
        goalDescription.textContent = tabText[defaultTitle];
    }

    // Attach click event listeners to each tab.
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Retrieve the tab title from the h3 element.
            const title = tab.querySelector('h3').textContent.trim();

            // Reset background of all tabs to grey.
            tabs.forEach(item => {
                item.style.backgroundColor = '#E5E4E2';
            });

            // Set the clicked tab's background to yellow.
            tab.style.backgroundColor = '#c4a700';

            // Update the description text.
            goalDescription.textContent = tabText[title];
        });
    });
});


window.addEventListener('scroll', function () {
    const aboutEl = document.querySelector('.about');
    // Set the element's top value equal to the current scroll offset.
    // This makes it appear to remain at the top even though it's absolute.
    aboutEl.style.top = window.scrollY + 'px';
});

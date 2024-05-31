// reviews-widget.js
let autoAdvanceInterval;
let reviewGenerationUrl;
let baseUrl;
let averageRating;
let reviews = [];
let entityId;
let currentIndex = 0;

async function initWidget(config) {
    entityId = config.entityId;
    baseUrl = config.baseUrl;

    try {
        const entityDetails = await fetchEntityDetails(baseUrl, entityId);
        reviewGenerationUrl = entityDetails.reviewGenerationUrl;

        entityName = entityDetails.name;
        reviews = await fetchReviews(baseUrl, entityId);

        displayCurrentReview();
    } catch (error) {
        console.error("Error initializing widget:", error);
    }
}


function calculateAverageRating() {
    if (reviews.length === 0) {
        document.getElementById("average-rating").textContent = 'No ratings yet';
        document.getElementById("star-icons").textContent = '';
        return;
    }
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    averageRating = totalRating / reviews.length;
    document.getElementById("average-rating").innerHTML = `<h1 class="hero-rating">${averageRating.toFixed(2)}</h1>`;
    document.getElementById("star-icons").innerHTML = getStarIcons(averageRating);
}

function displayCurrentReview() {
    if (reviews.length === 0) {
        console.log('No reviews to display');
        return; // Exit if there are no reviews
    }
    const review = reviews[currentIndex];
    if (!review) {
        console.error('No review at currentIndex:', currentIndex);
        return; // Exit if no review is found at the currentIndex
    }
    const reviewElement = createReviewElement(review);
    const container = document.getElementById("review-carousel-container");
    container.innerHTML = ''; // Clear previous content
    container.appendChild(reviewElement);
}

function createReviewElement(review) {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review';

    // Create header container
    const header = document.createElement('div');
    header.className = 'review-header';

    // Publisher icon
    const publisherIcon = document.createElement('img');
    publisherIcon.src = review.publisherIconUrl; // Assuming you have the URL in review object
    publisherIcon.className = 'publisher-icon';

    // Author and Date container
    const authorDateContainer = document.createElement('div');
    authorDateContainer.className = 'author-date-container';

    // Author
    const author = document.createElement('div');
    author.className = 'author';
    author.textContent = review.author;

    // Date
    const date = document.createElement('div');
    date.className = 'date';
    date.textContent = review.date;

    // Append author and date to their container
    authorDateContainer.appendChild(author);
    authorDateContainer.appendChild(date);

    // Append publisher icon and author-date container to header
    header.appendChild(publisherIcon);
    header.appendChild(authorDateContainer);

    // Rating
    const rating = document.createElement('div');
    rating.className = 'rating';
    rating.innerHTML = 'Rating: ' + review.rating; // Assuming review.rating contains the rating

    // Review content
    const content = document.createElement('div');
    content.className = 'review-content';
    content.textContent = review.content; // Assuming review.content contains the review text

    // Append header, rating, and content to review element
    reviewElement.appendChild(header);
    reviewElement.appendChild(rating);
    reviewElement.appendChild(content);

    return reviewElement;
}

function getPublisherIcon(publisher) {
    switch (publisher) {
        case 'GOOGLEMYBUSINESS':
            return 'https://www.yext-static.com/cms/spark/1/site-icon-250.svg';
        case 'FIRSTPARTY':
            return 'https://www.yext-static.com/cms/spark/1/site-icon-283.svg';
        case 'FACEBOOK':
            return 'https://www.yext-static.com/cms/spark/1/site-icon-71.svg';
        default:
            return ''; // Default to empty if no matching publisher
    }
}

function getStarIcons(rating) {
    const starTotal = 5;
    let starsHTML = '';
    for (let i = 0; i < starTotal; i++) {
        if (i < Math.floor(rating)) {
            starsHTML += '<span class="star filled">&#9733;</span>'; // Filled star
        } else if (i < Math.ceil(rating)) {
            starsHTML += '<span class="star half-filled">&#9733;</span>'; // Half-filled star for future implementation
        } else {
            starsHTML += '<span class="star">&#9734;</span>'; // Empty star
        }
    }
    return starsHTML;
}

function startAutoAdvance() {
    autoAdvanceInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % reviews.length;
        displayCurrentReview();
    }, 7000); // Advance every 7 seconds
}

function stopAutoAdvance() {
    clearInterval(autoAdvanceInterval);
}

async function fetchEntityDetails(baseUrl, entityId) {
    const apiUrl = `${baseUrl}entity/${entityId}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch entity details: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching entity details:', error);
        throw error;
    }
}

async function fetchReviews(baseUrl, entityId) {
    const apiUrl = `${baseUrl}entity/${entityId}/reviews`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }
        const data = await response.json();

        // Correctly accessing the docs within the response object
        if (data.response && data.response.docs) {
            console.log('Fetched reviews:', data.response.docs);
            return data.response.docs;
        } else {
            console.error('No reviews found in response:', data);
            return []; // Return an empty array if no reviews found to prevent errors
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error; // Rethrow the error for further handling if necessary
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    startAutoAdvance();

    prevButton.addEventListener('click', () => {
        stopAutoAdvance();
        currentIndex = (currentIndex === 0) ? reviews.length - 1 : currentIndex - 1;
        displayCurrentReview();
        startAutoAdvance();
    });

    nextButton.addEventListener('click', () => {
        stopAutoAdvance();
        currentIndex = (currentIndex + 1) % reviews.length;
        displayCurrentReview();
        startAutoAdvance();
    });
});

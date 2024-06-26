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
        document.getElementById("rc-average-rating").textContent = 'No ratings yet';
        document.getElementById("rc-star-icons").textContent = '';
        return;
    }
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    averageRating = totalRating / reviews.length;
    document.getElementById("rc-average-rating").innerHTML = `<h1 class="rc-hero-rating">${averageRating.toFixed(2)}</h1>`;
    document.getElementById("rc-star-icons").innerHTML = getStarIcons(averageRating);
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
    const container = document.getElementById("rc-review-carousel-container");
    container.innerHTML = ''; // Clear previous content
    container.appendChild(reviewElement);
}

function createReviewElement(review) {
    const reviewElement = document.createElement('div');
    reviewElement.classList.add('rc-review');
    const publisherIcon = getPublisherIcon(review.publisher);
    const formattedDate = new Date(review.reviewDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const starIcons = getStarIcons(review.rating, review.publisher);

    const truncatedContent = review.content.length > 175 ? review.content.substring(0, 175) + '...' : review.content;
    const fullContent = review.content.length > 175 ? review.content : '';

    reviewElement.innerHTML = `
        <div class="rc-review-details">
            <img class="rc-publisher-icon" src="${publisherIcon}" alt="${review.publisher}">
            <div class="rc-details-right">
                <p><strong>${review.authorName}</strong></p>
                <p>${formattedDate}</p>
                <p>${starIcons}</p>
                <p><strong>Review:</strong> <span class="rc-truncated-content">${truncatedContent}</span> ${review.content.length > 175 ? '<span class="rc-show-more-btn">Show more</span>' : ''}</p>
                <p class="rc-full-content" style="display: none;">${fullContent}</p>
            </div>
        </div>
    `;

    const showMoreBtn = reviewElement.querySelector('.rc-show-more-btn');
    const fullContentElem = reviewElement.querySelector('.rc-full-content');
    const truncatedContentElem = reviewElement.querySelector('.rc-truncated-content');

    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            fullContentElem.style.display = 'inline';
            truncatedContentElem.style.display = 'none';
            showMoreBtn.style.display = 'none';
        });
    }

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
            starsHTML += '<span class="rc-star filled">&#9733;</span>'; // Filled star
        } else if (i < Math.ceil(rating)) {
            starsHTML += '<span class="rc-star half-filled">&#9733;</span>'; // Half-filled star for future implementation
        } else {
            starsHTML += '<span class="rc-star">&#9734;</span>'; // Empty star
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
    const prevButton = document.getElementById('rc-prev-button');
    const nextButton = document.getElementById('rc-next-button');

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

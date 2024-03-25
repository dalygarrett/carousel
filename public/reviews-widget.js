document.addEventListener('DOMContentLoaded', function () {
    let currentReviewIndex = 0; // Track the index of the current review being displayed
    let averageRating;
    let entityName;
    let reviews = []; // Declare reviews in the outer scope

    function initWidget(config) {
        // Extract the entity ID from the configuration
        const entityId = config.entityId;
        const baseUrl = config.baseUrl;

        console.log("Entity Id :", entityId);
        console.log("Base URL :", baseUrl);

        // Make the first API call to retrieve entity details
        fetchEntityDetails(baseUrl, entityId)
            .then((entityDetails) => {
                console.log("Entity Details:", entityDetails);

                // Store review generation URLs
                reviewGenerationUrl = entityDetails.reviewGenerationUrl;
                firstPartyReviewPage = entityDetails.firstPartyReviewPage;

                // Extract entity name
                entityName = entityDetails.name;

                // Make the second API call to retrieve reviews using the obtained entity ID
                return fetchReviews(baseUrl, entityId);
            })
            .then((fetchedReviews) => {
                console.log("Reviews:", fetchedReviews);

                // Update the reviews variable with the fetched reviews
                reviews = fetchedReviews;

                // Extract review details
                const reviewDetails = reviews.map((review) => ({
                    authorName: review.authorName,
                    content: review.content,
                    publisher: review.publisher,
                    rating: review.rating,
                    reviewDate: review.reviewDate,
                    comments: review.comments,
                }));

                // Calculate the average rating
                const totalRating = reviewDetails.reduce((sum, review) => sum + review.rating, 0);
                averageRating = reviewDetails.length > 0 ? totalRating / reviewDetails.length : 0;

                // Your widget initialization code here, using entity details, reviews data, review URLs, and average rating
                console.log("Review Generation URL:", reviewGenerationUrl);
                console.log("First Party Review Page:", firstPartyReviewPage);
                console.log("Average Rating:", averageRating);

                // Display paginated reviews
                displayReviews();
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    function displayReviews() {
        // Display total count and average rating
        const totalCountElement = document.getElementById("total-count");
        const averageRatingElement = document.getElementById("average-rating");
        const starIconsElement = document.getElementById("star-icons");
        const reviewsContainer = document.getElementById("reviews-container");
        const paginationContainer = document.getElementById("pagination-container");

        if (!Array.isArray(reviews) || reviews.length === 0) {
            totalCountElement.innerHTML = "<h2>Be the first to leave a review!</h2>";
            averageRatingElement.textContent = "";
            starIconsElement.innerHTML = "";
            reviewsContainer.innerHTML = ""; // Clear reviews container
            paginationContainer.innerHTML = ""; // Clear pagination container
            return;
        }

        // Calculate the average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        // Display total count and average rating
        totalCountElement.textContent = `Total Reviews: ${reviews.length}`;
        averageRatingElement.textContent = `Average Rating: ${averageRating.toFixed(2)}`;
        starIconsElement.innerHTML = getStarIcons(averageRating);

        // Display carousel reviews
        reviewsContainer.innerHTML = ""; // Clear reviews container
        const reviewElement = createReviewElement(reviews[currentReviewIndex]);
        reviewsContainer.appendChild(reviewElement);

        // Display pagination controls (if needed)
        paginationContainer.innerHTML = ""; // Clear pagination container
    }

    function createReviewElement(review) {
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('review');

        // Determine the publisher icon based on the publisher value
        let publisherIcon = '';
        switch (review.publisher) {
            case 'GOOGLEMYBUSINESS':
                publisherIcon = 'https://www.yext-static.com/cms/spark/1/site-icon-250.svg';
                break;
            case 'FIRSTPARTY':
                publisherIcon = 'https://www.yext-static.com/cms/spark/1/site-icon-283.svg';
                break;
            case 'FACEBOOK':
                publisherIcon = 'https://www.yext-static.com/cms/spark/1/site-icon-71.svg';
                break;
            // Add more cases for other publishers if needed
            default:
                publisherIcon = ''; // Default to empty if no matching publisher
        }

        const formattedReviewDate = review.reviewDate
            ? new Date(review.reviewDate).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
              })
            : 'Date Not Available';

        reviewElement.innerHTML = `
            <div class="review-details">
                <img class="publisher-icon" src="${publisherIcon}" alt="${review.publisher}">
                <div class="details-right">
                    <p><strong>Date:</strong> ${formattedReviewDate}</p>
                    <p><strong>Author:</strong> ${review.authorName}</p>
                    <p><strong>Rating:</strong> ${getStarIcons(review.rating, review.publisher)}</p>
                    ${review.content ? `<p><strong>Review:</strong> ${review.content}</p>` : ''}
                </div>
            </div>
        `;

        const commentElement = createCommentHTML(review.comments, entityName);
        if (commentElement) {
            reviewElement.appendChild(commentElement);
        }

        return reviewElement;
    }

    function nextReview() {
        currentReviewIndex = (currentReviewIndex + 1) % reviews.length;
        displayReviews();
    }

    function previousReview() {
        currentReviewIndex = (currentReviewIndex - 1 + reviews.length) % reviews.length;
        displayReviews();
    }

    // Display reviews initially
    displayReviews();

    // Add event listeners for carousel navigation
    const nextButton = document.getElementById('next-button');
    nextButton.addEventListener('click', nextReview);

    const prevButton = document.getElementById('prev-button');
    prevButton.addEventListener('click', previousReview);
});

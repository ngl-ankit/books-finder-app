document.addEventListener("DOMContentLoaded", function () {
    // DOM elements
    const DarkModeToggle = document.getElementById("darkModeToggle");
    const DarkModeIcon = document.getElementById("darkModeIcon");
    const SearchForm = document.getElementById("searchForm");
    const QueryInput = document.getElementById("query");
    const AuthorInput = document.getElementById("author");
    const SubjectInput = document.getElementById("subject");
    const LanguageInput = document.getElementById("language");
    const ResultsContainer = document.getElementById("results");
    const LoadingIndicator = document.getElementById("loading");
    const LoadingOverlay = document.getElementById("loadingOverlay");
    const ErrorContainer = document.getElementById("error");
    const PaginationContainer = document.getElementById("pagination");
    const Modal = document.getElementById("modal");
    const ModalContent = document.querySelector(".modal-content");
    const PrevButton = document.getElementById("prevButton");
    const NextButton = document.getElementById("nextButton");
    const RecommendedBooksContainer = document.getElementById('recommendedBooks');

    // API URL
    const ApiUrl = "https://openlibrary.org/search.json";

    // Constants
    const resultsPerPage = 10;
    const maxResults = 50;
    let currentPage = 1;

    // Event listeners
    DarkModeToggle.addEventListener("click", toggleDarkMode);
    SearchForm.addEventListener("submit", handleSearch);
    PaginationContainer.addEventListener("click", handlePagination);
    fetchRecommendedBooks();

    // Fetch and display recommended books
    fetchRecommendedBooks();

    async function fetchRecommendedBooks() {
        try {
            LoadingIndicator.style.display = "block";
            const url = `${ApiUrl}?q=best&limit=12`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch recommended books');
            }
            const data = await response.json();
            displayRecommendedBooks(data.docs);
        } catch (error) {
            console.error('Error fetching recommended books:', error);
        }
    }

    function displayRecommendedBooks(books) {
        RecommendedBooksContainer.innerHTML = '';
        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('recommended-item');
            bookElement.innerHTML = `
               <h3>${book.title}</h3>
               <p>Author: ${book.author_name ? book.author_name.join(', ') : 'Unknown'}</p>
               <p>First Published: ${book.first_publish_year ? book.first_publish_year : 'Unknown'}</p>
           `;
            LoadingIndicator.style.display = "none";
            RecommendedBooksContainer.appendChild(bookElement);
        });
    }

    function handleSearch(event) {
        event.preventDefault();
        const query = QueryInput.value.trim();
        if (!query) return;

        const author = AuthorInput.value.trim();
        const subject = SubjectInput.value.trim();
        const language = LanguageInput.value.trim();

        currentPage = 1;
        fetchResults(query, author, subject, language, currentPage);
    }

    async function fetchResults(query, author, subject, language, page) {
        try {
            LoadingOverlay.style.display = "flex";
            LoadingIndicator.style.display = "block";
            ErrorContainer.textContent = "";
            const start = (page - 1) * resultsPerPage;
            const url =
                `${ApiUrl}?q=${encodeURIComponent(
                    query
                )}&limit=${resultsPerPage}&offset=${start}` +
                `${author ? `&author=${encodeURIComponent(author)}` : ""}` +
                `${subject ? `&subject=${encodeURIComponent(subject)}` : ""}` +
                `${language ? `&language=${encodeURIComponent(language)}` : ""}` +
                `&limit=${maxResults}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            displayResults(data.docs);
            displayPagination(data.numFound, page);
        } catch (error) {
            console.error("Error fetching results:", error);
            ErrorContainer.textContent = "An error occurred. Please try again.";
        } finally {
            LoadingOverlay.style.display = "none";
            LoadingIndicator.style.display = "none";
        }
    }

    function displayResults(results) {
        ResultsContainer.innerHTML = "";
        if (results.length === 0) {
            ResultsContainer.innerHTML = "<p>No results found.</p>";
            PaginationContainer.innerHTML = "";
            return;
        }

        results.forEach((item) => {
            const resultElement = document.createElement("div");
            resultElement.classList.add("result-item");
            resultElement.innerHTML = `
            <h3>${item.title}</h3>
            <p>Author: ${item.author_name ? item.author_name.join(", ") : "Unknown"
                }</p>
            <p>First Published: ${item.first_publish_year ? item.first_publish_year : "Unknown"
                }</p>
            <a href="#" data-key="${item.key}">Read More</a>
        `;

            resultElement
                .querySelector("a")
                .addEventListener("click", function (event) {
                    event.preventDefault();
                    showModal(item.key);
                });

            ResultsContainer.appendChild(resultElement);
        });
    }

    function displayPagination(totalResults, currentPage) {
        PaginationContainer.innerHTML = "";
        const totalPages = Math.ceil(totalResults / resultsPerPage);

        if (totalPages > 1) {
            // Previous Button
            if (currentPage > 1) {
                const prevButton = document.createElement("a");
                prevButton.href = "#";
                prevButton.textContent = "Prev";
                prevButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    currentPage--;
                    const query = QueryInput.value.trim();
                    const author = AuthorInput.value.trim();
                    const subject = SubjectInput.value.trim();
                    const language = LanguageInput.value.trim();
                    fetchAndDisplayResults(query, author, subject, language);
                });
                PaginationContainer.appendChild(prevButton);
            }

            // Page Links
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(startPage + 4, totalPages);

            for (let i = startPage; i <= endPage; i++) {
                const pageLink = document.createElement("a");
                pageLink.href = "#";
                pageLink.textContent = i;
                pageLink.dataset.page = i;

                if (i === currentPage) {
                    pageLink.classList.add("active");
                }

                pageLink.addEventListener("click", function (event) {
                    event.preventDefault();
                    currentPage = i;
                    const query = QueryInput.value.trim();
                    const author = AuthorInput.value.trim();
                    const subject = SubjectInput.value.trim();
                    const language = LanguageInput.value.trim();
                    fetchAndDisplayResults(query, author, subject, language);
                });

                PaginationContainer.appendChild(pageLink);
            }

            // Next Button
            if (currentPage < totalPages) {
                const nextButton = document.createElement("a");
                nextButton.href = "#";
                nextButton.textContent = "Next";
                nextButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    currentPage++;
                    const query = QueryInput.value.trim();
                    const author = AuthorInput.value.trim();
                    const subject = SubjectInput.value.trim();
                    const language = LanguageInput.value.trim();
                    fetchAndDisplayResults(query, author, subject, language);
                });
                PaginationContainer.appendChild(nextButton);
            }
        }
    }

    //  buttons visibility
    if ("LoadingIndicator.style.display = 'block';") {
        PrevButton.style.display = `none`;
        NextButton.style.display = `none`;
    }
    function handlePagination(event) {
        if (event.target.tagName === "A") {
            event.preventDefault();
            currentPage = parseInt(event.target.dataset.page);
            const query = QueryInput.value.trim();
            const author = AuthorInput.value.trim();
            const subject = SubjectInput.value.trim();
            const language = LanguageInput.value.trim();
            fetchResults(query, author, subject, language, currentPage);
        }
    }

    function toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
        updateDarkModeIcon();
        saveDarkModePreference();
    }

    function updateDarkModeIcon() {
        if (document.body.classList.contains("dark-mode")) {
            DarkModeIcon.classList.remove("fa-sun");
            DarkModeIcon.classList.add("fa-moon");
        } else {
            DarkModeIcon.classList.remove("fa-moon");
            DarkModeIcon.classList.add("fa-sun");
        }
    }

    function saveDarkModePreference() {
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", "disabled");
        }
    }

    // Function to show modal with book details
    async function showModal(key) {
        const url = `https://openlibrary.org${key}.json`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch book details');
            }
            const bookDetails = await response.json();

            // Populate modal content with fetched data
            ModalContent.innerHTML = `
            <span class="close">&times;</span>
            <h2>${bookDetails.title || 'Unknown'}</h2>
            <p><strong>Author:</strong> ${bookDetails.authors && bookDetails.authors.length > 0 ? bookDetails.authors.map(author => author.name).join(', ') : 'Unknown'}</p>
            <p><strong>First Published:</strong> ${bookDetails.first_publish_year || 'Unknown'}</p>
            <p><strong>Subjects:</strong> ${bookDetails.subjects ? bookDetails.subjects.join(', ') : 'Unknown'}</p>
            <p><strong>Description:</strong> ${bookDetails.description ? (typeof bookDetails.description === 'string' ? bookDetails.description : bookDetails.description.value) : 'Unknown'}</p>
            <p><strong>Number of Pages:</strong> ${bookDetails.number_of_pages || 'Unknown'}</p>
            <p><strong>Publisher:</strong> ${bookDetails.publishers && bookDetails.publishers.length > 0 ? bookDetails.publishers.map(publisher => publisher.name).join(', ') : 'Unknown'}</p>
        `;

            // Display the modal
            Modal.style.display = 'block';

            // Close modal when the close button (×) is clicked
            const closeModal = Modal.querySelector('.close');
            closeModal.addEventListener('click', function () {
                Modal.style.display = 'none';
            });

            // Close modal when clicking outside the modal content
            window.addEventListener('click', function (event) {
                if (event.target === Modal) {
                    Modal.style.display = 'none';
                }
            });

        } catch (error) {
            console.error('Error fetching book details:', error);
            ErrorContainer.textContent = 'Failed to fetch book details. Please try again.';
        }
    }

});
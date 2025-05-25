# Content Safety Checker Browser Extension

This is a browser extension I built to help identify potentially harmful or misleading content on social media platforms like Facebook and GitHub.

## Features

The extension adds a "Safety Check" button to posts and comments. When clicked, it analyzes the content for:

-   **Toxicity:** Detects potentially toxic or hateful language.
-   **Emotional Manipulation:** Identifies common tactics used to manipulate emotions (e.g., urgency, fear, guilt, exaggeration).
-   **Sentiment Analysis:** Determines the overall emotional tone of the content (positive, negative, neutral).
-   **Source Credibility:** (Basic check) Analyzes linked URLs to see if they come from a list of trusted news sources.

## How it Works

The extension consists of two main parts:

1.  **Frontend (Browser Extension):** Written in JavaScript, HTML, and CSS. This part runs in your browser, detects posts/comments on supported websites, injects the "Safety Check" button, and sends the content to the backend API for analysis.
2.  **Backend (Flask API):** Written in Python using the Flask framework. This part receives the content from the extension, performs the various safety checks using libraries like `TextBlob`, and returns the analysis results.

## Setup

To use this extension, you need to set up both the backend API and install the extension in your browser.

### 1. Backend Setup

1.  Navigate to the `backend` directory in your terminal:
    ```bash
    cd backend
    ```
2.  Install the required Python packages. It's recommended to use a virtual environment (like `venv`):
    ```bash
    # Create a virtual environment (if you don't have one)
    python -m venv .venv
    
    # Activate the virtual environment
    # On Windows PowerShell:
    .venv\Scripts\Activate.ps1
    # On macOS/Linux or Windows Git Bash/WSL:
    source .venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    ```
3.  Run the Flask API server:
    ```bash
    python api.py
    ```
    The API should start running on `http://localhost:5000`.

### 2. Frontend Installation (Chrome/Edge)

1.  Open your browser and go to the Extensions page (e.g., `chrome://extensions/` in Chrome or `edge://extensions/` in Edge).
2.  Enable **Developer mode** using the toggle switch in the top right corner.
3.  Click the **Load unpacked** button in the top left corner.
4.  Select the root directory of this project (the folder containing `manifest.json`).
5.  The "Content Safety Checker" extension should now appear in your list of installed extensions.

## Usage

1.  Make sure the backend Flask API is running (`python api.py` in the `backend` directory).
2.  Navigate to a supported website (e.g., Facebook or GitHub).
3.  You should see a "🛡️ Safety Check" button appear below posts or comments.
4.  Click the button to perform a content safety analysis. A popup will appear with the results.
5.  Close the popup by clicking the 'x' button.

## Customization

You can customize the extension by modifying the code:

-   **Backend (`backend/api.py`):** Adjust the toxicity word list, emotional manipulation indicators, trusted sources, or add entirely new analysis features.
-   **Frontend (`content.js`):** Modify the selectors to target different elements on supported websites, change the button text or appearance, or alter how the results are displayed.
-   **Styling (`style.css`):** Change the look and feel of the button and the results popup.

## Contributing

I welcome contributions to make this Content Safety Checker even better! Here are some ways you can contribute:

-   **Add more sophisticated analysis:** Implement more advanced natural language processing techniques or integrate with external AI models for improved toxicity detection, sentiment analysis, or claim verification.
-   **Expand platform support:** Add selectors and logic to support other social media or content platforms.
-   **Improve the UI/UX:** Enhance the appearance and usability of the extension and the analysis popup.
-   **Add more trusted sources:** Expand the list of trusted domains for source credibility checking.
-   **Bug fixes and performance improvements:** Address any issues and optimize the code for better performance.

To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and test them thoroughly.
4.  Commit your changes with clear and concise messages.
5.  Push your branch to your fork.
6.  Open a pull request to the main repository, describing your changes.

## Technologies Used

-   **Frontend:** HTML, CSS, JavaScript
-   **Backend:** Python, Flask, Flask-CORS
-   **Libraries:** TextBlob
-   **Environment:** venv

## License

This project is licensed under the [MIT License](LICENSE).

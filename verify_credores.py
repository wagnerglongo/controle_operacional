from playwright.sync_api import sync_playwright
import json

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Mock Data
    credores_data = [
        {"id": 1, "nome": "Test Creditor", "credor_id": 99, "over_id": 0, "slug": "test", "container_id": "test-credor-99"}
    ]
    users_data = [
        {"id": 101, "nome": "Test User", "status": "junior", "metas": "100", "credor": "99", "dt_entrada": "2023-01-01", "periodo": "manha", "over": 0, "container": "test-credor-99"}
    ]

    # Handlers
    def handle_credores(route):
        print(f"Intercepted {route.request.url}")
        route.fulfill(status=200, content_type="application/json", body=json.dumps(credores_data))

    def handle_users(route):
        print(f"Intercepted {route.request.url}")
        route.fulfill(status=200, content_type="application/json", body=json.dumps(users_data))

    # Setup routes - match strict URL or pattern
    page.route("**/php/api_credores.php", handle_credores)
    page.route("**/php/load_users.php", handle_users)

    # Navigate
    print("Navigating...")
    page.goto("http://localhost:8000/index.php")

    # Wait for dynamic content
    try:
        # Wait for card
        page.wait_for_selector("#test-credor-99", timeout=10000)
        print("Creditor card found.")
    except Exception as e:
        print(f"Failed to find creditor card: {e}")
        page.screenshot(path="/home/jules/verification/failure_main.png")
        # Dump page content for debug
        with open("/home/jules/verification/page_dump.html", "w") as f:
            f.write(page.content())
        browser.close()
        return

    try:
        # Wait for user
        page.wait_for_selector("#user-list-test-credor-99 .list-group-item", timeout=5000)
        print("User item found.")
    except Exception as e:
        print(f"Failed to find user item: {e}")

    # Open Modal
    print("Opening modal...")
    try:
        page.click("text=Gerenciar Credores")
        page.wait_for_selector("#manageCredoresModal", state="visible", timeout=5000)
        print("Modal visible.")

        # Verify table
        page.wait_for_selector("text=Test Creditor", timeout=5000)
        print("Table data verified.")

        # Take screenshot of modal open
        page.screenshot(path="/home/jules/verification/verification.png")
        print("Screenshot saved to /home/jules/verification/verification.png")

    except Exception as e:
        print(f"Failed to verify modal: {e}")
        page.screenshot(path="/home/jules/verification/failure_modal.png")

    browser.close()

with sync_playwright() as p:
    run(p)

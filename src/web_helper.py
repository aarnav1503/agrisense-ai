import requests
from bs4 import BeautifulSoup
import re
from typing import List, Dict

def fetch_web_info(query: str) -> List[Dict[str, str]]:
    """
    Fetches real-time information from the web to supplement crop diagnosis.
    Uses DuckDuckGo HTML search for a lightweight, no-API-key solution.
    """
    try:
        # Search for treatment, management, and latest research
        search_query = f"{query} treatment management control"
        url = f"https://html.duckduckgo.com/html/?q={search_query.replace(' ', '+')}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        results = []

        # Find result snippets
        snippets = soup.find_all("div", class_="result__body")
        
        for item in snippets[:5]:  # Get top 5 results
            title_elem = item.find("a", class_="result__a")
            snippet_elem = item.find("a", class_="result__snippet")
            
            if title_elem and snippet_elem:
                title = title_elem.get_text()
                link = title_elem.get("href", "")
                snippet = snippet_elem.get_text()
                
                # Filter for useful agronomy sources if possible (heuristic)
                # We want to prioritize educational, government, or specialized agri sites
                priority = 0
                if any(ext in link for ext in [".edu", ".gov", ".org", "extension", "agri", "crop", "plant"]):
                    priority = 1
                
                results.append({
                    "title": title,
                    "link": link,
                    "snippet": snippet,
                    "priority": priority
                })

        # Sort by priority
        results.sort(key=lambda x: x["priority"], reverse=True)
        return results

    except Exception as e:
        print(f"Web scraping error: {e}")
        return []

def extract_latest_trends(web_results: List[Dict[str, str]]) -> List[str]:
    """
    Extracts key insights or 'latest trends' from web snippets.
    """
    insights = []
    # Look for common action keywords in snippets
    keywords = ["fungicide", "resistant variety", "biological control", "integrated pest management", "rotation"]
    
    for res in web_results:
        snippet = res["snippet"].lower()
        for kw in keywords:
            if kw in snippet and kw not in insights:
                # Find the sentence containing the keyword
                sentences = re.split(r'(?<=[.!?])\s+', res["snippet"])
                for s in sentences:
                    if kw in s.lower() and len(s) > 20:
                        insights.append(s.strip())
                        break
        if len(insights) >= 3:
            break
            
    return insights

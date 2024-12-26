## Market Lens Front-End Overview

This document outlines the requirements that I have for the front-end of this project. Find the repository for the back-end [here](https://github.com/bzzling/market-lens-back-end).

## Features

- **User Authentication**
    - Sign up and login using their email and password or GitHub account
        - Initially aimed to incorporate Google & Apple authentication, but found the process to have more barriers regarding privacy than GitHub
    - User can sign in even if they forgot their password
        - This is now handled by SupaBase
    - User stays logged in when exiting tab
        - Accomplished through Supabase's session management system using secure HTTP-only cookies
    - Navigation bar updates based on sign in status
        - Implemented using real-time session monitoring and Supabase's auth state changes

- **Dashboard**
    - Provide a clean UI to view holdings and performance via charts
        - Employ a modern layout which is currently lacking in major investment simulation options such as banks and investopedia (in development)
    - Incorporate transaction functionality to enable users to buy and sell stocks at real-time prices
        - Utilize multiple API's integrated as endpoints through the RESTful API deployed on AWS (in development)

- **AI**
    - Incorporate AI to provide users with insights and recommendations based on their portfolio
        - Planning on fine-tuning the open-source LLama model to understand financial language

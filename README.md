# Gemini AI for Web Developer

Showcase of Gemini AI for Web Developer. Build with:
- NodeJS (vanilla)
- Turso database for saving previous result
- HTML, CSS and JavaScript

## TODO
- [x] Render markdown to html
- [x] Save result into db
- [x] List results
- [x] Deploy
- [x] Add github ribbon
- [x] Add upvote and downvote
- [ ] Load previous result into form
- [ ] Load previous result if exist
- [ ] User agent -> uuid -> upvote and downvote
- [x] Add social share
- [x] Responsive design for mobile

## Deployment

Using cloudrun?

```
$ gcloud init
$ gcloud run deploy --source . --set-env-vars "KEY1=VALUE1,KEY2=VALUE2"  # service name: gemini-mendang-mending
```

## Example Questions

- Basket mending 3 poin atau slam dunk?
- Manga mending Slam Dunk atau Dragonball?
- Liburan mending Jogja atau Semarang?
- Cuaca mending hujan atau panas?
- Laptop mending macbook atau thinkpad?
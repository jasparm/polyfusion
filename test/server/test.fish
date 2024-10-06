#!/usr/bin/fish

set url "localhost:3000"

http POST "$url/signup" user="test" pass="test"
set login_reponse (http POST "$url/login" user="test" pass="test")
set token (echo $login_reponse | jq -r '.token')



http POST "$url/storeshape"


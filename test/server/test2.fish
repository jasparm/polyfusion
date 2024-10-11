#!/usr/bin/fish

# Base URL for the server
set url "http://localhost:3000"

# Test user details
set user "test"
set pass "test"

# Test: Sign up a new user
echo "Testing /signup"
http -b POST "$url/signup" user="$user" pass="$pass"

http -b POST "$url/signup" user="users" pass="$pass"

http -b POST "$url/signup" user="user" pass="$pass"

# Test: Login and capture token
echo "Testing /login"
set login_response (http -b POST "$url/login" user="$user" pass="$pass")
set token (echo $login_response | jq -r '.token')

# Test: Store a shape
echo "Testing /storeshape"
set shape_data type="2D" name="stupid" data={} image="img"
http -b -A bearer -a $token POST "$url/storeshape" $shape_data

# Test: Get shapes (2D example)
echo "Testing /shapes/2D"
http -b -A bearer -a $token GET "$url/shapes/2D"

# Test: Get a specific shape by name
echo "Testing /shape/2D/stupid"
http -b -A bearer -a $token GET "$url/shape/2D/stupid" 

# Test: Update the shape
echo "Testing /updateshape:stupid"
set updated_shape type="2D" name="stupid" data={} image="img_ahhhh"
http -b -A bearer -a $token PUT "$url/updateshape:stupid" $updated_shape

echo "Testing /shape/2D/stupid"
http -b -A bearer -a $token GET "$url/shape/2D/stupid" 

# Test: Delete the shape
echo "Testing /deleteshape:stupid"
http -b -A bearer -a $token POST "$url/deleteshape:stupid" 

# Test: Get shapes (2D example)
echo "Testing /shapes/2D"
http -b -A bearer -a $token GET "$url/shapes/2D"
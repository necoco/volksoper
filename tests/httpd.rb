require 'webrick'
include WEBrick

server = HTTPServer.new(
    :Port => 8080,
    :DocumentRoot => Dir::pwd
)

server.start

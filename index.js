var parseXML = require('xml2js').parseString;
var http = require('http');

module.exports = {
	latestPosts: latestPosts
}

function latestPosts(message, config)
{
	return new Promise(function(resolve) {
		latestPostsPromise(message, config, resolve);
	});
}

function latestPostsPromise(message, config, callback) {
    //LATESTPOSTS
			
	var q = message.content.substring(message.content.indexOf(' ')).trim();
	
	var postCount = parseInt(q);
	
	if (!postCount)
	{
		postCount = 1;
	}
	
	http.get({
	host: config.host,
	path: "/feed/"
	},
	function(response) {
		var body = '';
		response.on("data",
			function(d) {
				body += d;
			}
		);
		response.on("end", function() {
			parseXML(body, function (err, result) {
				var messageText = "";
				
				for (var i = 0; i < postCount && i < result.rss.channel[0].item.length; i++)
				{
					var item = result.rss.channel[0].item[i];
					
					var nextPost = "**" + item.title +
						"**\n```" +
						unescape(item.description).replace(/&#8230;/, "...").replace(/&#8217;/, "'").replace(/&#038;/, "") + 
						"```\n*Read more at:* <" +
						item.link + ">\n\n";
					
					if (messageText.length + nextPost.length > 2000)
					{
						message.channel.send(messageText);
						messageText = "";
					}
					
					messageText += nextPost;
				}
				
				message.channel.send(messageText);
				callback("success");
			});
		});
	});
}
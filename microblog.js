function Microblog(container, users, posts) {
	this.container = document.querySelector(container);
	this.users = users;
	this.posts = posts;
	this.currentUser = {};
	this.lastPostId = this.posts[this.posts.length - 1].id;
	this.replyId = null;
	this.callback = function() {};
}

Microblog.prototype.useWebStorage = function() {
	try {
		sessionStorage.setItem('test', 'test');
		sessionStorage.removeItem('test');
		return true;
	} catch (e) {
		console.warn('Session storage is not supported.', e);
		return false;
	}
};

Microblog.prototype.storeData = function(type) {
	var webStorageAvail = this.useWebStorage();

	if (webStorageAvail) {
		if (type === 'users') {
			sessionStorage.setItem('users', JSON.stringify(this.users));
		}

		if (type === 'posts') {
			sessionStorage.setItem('posts', JSON.stringify(this.posts));
		}
	}
};

Microblog.prototype.getData = function() {
	var webStorageAvail = this.useWebStorage();

	if (webStorageAvail) {
		var ssUsers = sessionStorage.getItem('users');
		var ssPosts = sessionStorage.getItem('posts');

		if (typeof ssUsers !== 'undefined' && ssUsers !== null) {
			this.users = JSON.parse(ssUsers);
		}

		if (typeof ssUsers !== 'undefined' && ssPosts !== null) {
			this.posts = JSON.parse(ssPosts);
		}
	}
};

Microblog.prototype.timeSince = function(ts) {
	var now = new Date();
	var timeStamp = new Date(ts * 1000);
	var secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;

	if (secondsPast < 60) {
		return parseInt(secondsPast) + 's';
	}

	if (secondsPast < 3600) {
		return parseInt(secondsPast / 60) + 'm';
	}

	if (secondsPast <= 86400) {
		return parseInt(secondsPast / 3600) + 'h';
	}

	if (secondsPast > 86400) {
		day = timeStamp.getDate();
		month = timeStamp
			.toDateString()
			.match(/ [a-zA-Z]*/)[0]
			.replace(' ', '');
		year =
			timeStamp.getFullYear() == now.getFullYear()
				? ''
				: ' ' + timeStamp.getFullYear();
		return day + ' ' + month + year;
	}
};

Microblog.prototype.insertPhotos = function(photoArray) {
	var html = '';

	if (photoArray && photoArray.length > 0) {
		for (var i = 0; i < photoArray.length; i++) {
			html += '<img src="' + photoArray[i] + '"/>';
		}
	}

	return html;
};

Microblog.prototype.postIt = function(post, newPost) {
	var frag = document.createDocumentFragment();
	var el = document.createElement('div');
	var tsYear = new Date(post.ts).getFullYear() + 'y';
	var tsDate = new Date(post.ts).getDate() + 'd';
	var tsHours = new Date(post.ts).getHours() + 'h';
	var replyTo;

	if (post.photos && post.photos.length > 0) {
		for (let i = 0; i < post.photos.length; i++) {
			post.message = post.message.replace(post.photos[i], '');
		}
	}

	el.setAttribute('data-id', post.id);
	el.classList.add('post');

	if (this.currentUser.username === this.users[post.user].username) {
		el.classList.add('loggedin-user');
	}

	/* 
      *  - Using this hack since I don't know how to reference the user account image
      *    since there is no true reference in data objects
      *  - static images renamed to usernames to be able to use
      */
	if (
		newPost ||
		this.currentUser.username === this.users[post.user].username
	) {
		el.innerHTML +=
			'<div class="post-user--avatar"><img src="' +
			this.users[post.user].username +
			'.svg" /></div>';
	} else {
		el.innerHTML +=
			'<div class="post-user--avatar"><img src="' +
			this.users[post.user].username +
			'.jpg" /></div>';
	}

	el.innerHTML +=
		'<div class="post-user--posted">' +
		'<div class="post-user--posted_info">' +
		'<i class="material-icons" data-verified="' +
		this.users[post.user].verified +
		'">verified_user</i>' +
		'<user data-realname="' +
		this.users[post.user].real_name +
		'" data-username="' +
		this.users[post.user].username +
		'"></user>' +
		'<span data-ts="' +
		post.ts +
		'" class="post-user--posted_info-timestamp">' +
		this.timeSince(post.ts) +
		'</span>' +
		'</div>' +
		'<div class="post-user--posted_message">' +
		'<q>' +
		post.message +
		'</q>' +
		'<div class="post-user--posted_message-photos">' +
		this.insertPhotos(post.photos) +
		'</div>' +
		'<cite>' +
		post.user +
		'</cite>' +
		'<ul class="post-user--posted_message-social">' +
		'<li>' +
		'<input type="button" class="material-icons" data-id="' +
		post.id +
		'" value="reply">' +
		'<input type="button" class="material-icons" data-id="' +
		post.id +
		'" value="repeat">' +
		'<input type="button" class="material-icons" data-id="' +
		post.id +
		'" value="favorite">' +
		'</li>' +
		'<li>' +
		'<span data-type="reply">0</span>' +
		'<span data-type="repeat">0</span>' +
		'<span data-type="favorite">0</span>' +
		'</li>' +
		'</ul>' +
		'</div>' +
		'<div class="post-user--posted_message-replies"></div>' +
		'</div>';

	if (typeof post.reply_to !== 'undefined' && post.reply_to !== null) {
		replyTo = document.querySelector(
			'[data-id="' +
				post.reply_to +
				'"] .post-user--posted_message-replies'
		);
		frag.appendChild(el);
		replyTo.appendChild(frag);
	} else {
		frag.appendChild(el);
		this.container.appendChild(frag);
	}

	this.bind_newPostEvents(el);

	if (newPost) {
		el.classList.add('loggedin-user');
		el.classList.add('latest-post');

		setTimeout(function() {
			el.classList.add('fade-in');
		}, 50);
	}

	this.lastPostId = parseInt(post.id); // used to increment to the next post ID
};

Microblog.prototype.bind_newPostEvents = function(post) {
	var _this = this;
	var inputs = post.querySelectorAll('input.material-icons');
	var newPost = document.getElementById('new_post');
	var message = newPost.querySelector('textarea[id="text_post_message"]');

	function increment(target) {
		var tParent = target.parentElement;
		var tParentSibling = tParent.nextSibling;
		var tCounter = tParentSibling.querySelector(
			'span[data-type=' + target.value + ']'
		);

		var value = parseInt(tCounter.innerHTML);

		if (target.value === 'favorite') {
			if (target.classList.contains('done')) {
				tCounter.innerHTML = value - 1;
				target.classList.remove('done');
			} else {
				tCounter.innerHTML = value + 1;
				target.classList.add('done');
			}
		} else {
			tCounter.innerHTML = value + 1;
		}
	}

	function repeat(id) {
		var post;
		var value;
		var now;
		var repost = {};
		var reposted = false;

		for (let i = 0; i < _this.posts.length; i++) {
			post = _this.posts[i];

			if (!reposted) {
				for (key in post) {
					value = post[key];

					if (value === parseInt(id)) {
						// Copy message and photos
						repost.message = post.message;
						repost.photos = post.photos;

						// Update post ID
						repost.id = _this.lastPostId + 1;

						// Update User to Current User Logged In
						repost.user = _this.currentUser.id;

						// Update timestamp of repost
						now = new Date();
						repost.ts = now.getTime() / 1000;

						_this.posts.push(repost);
						_this.storeData('posts');
						_this.postIt(repost, true);
						_this.callback();
						reposted = true;
						break;
					}
				}
			}
		}
	}

	function fave(id) {
		_this.callback();
	}

	function reply(id) {
		_this.replyId = id;

		message.focus();
		message.classList.add('reply');
	}

	function social_clickHandler(e) {
		var target = e.currentTarget;
		var postId = target.getAttribute('data-id');
		var proceed;

		_this.callback = function() {
			increment(target);
		}.bind(target);

		switch (target.value) {
			case 'repeat':
				proceed = confirm('Continue to repost?');
				if (proceed) {
					repeat(postId);
				}
				break;

			case 'favorite':
				fave(postId);
				break;

			default:
				// reply
				reply(postId);
				break;
		}
	}

	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener('click', social_clickHandler);
	}
};

Microblog.prototype.createPosts = function() {
	var post;

	for (var i = 0; i < this.posts.length; i++) {
		post = this.posts[i];
		this.postIt(post, false);
	}
};

Microblog.prototype.bindEvents = function() {
	var _this = this;
	var newPost = document.getElementById('new_post');
	var message = newPost.querySelector('textarea[id="text_post_message"]');
	var postBtn = newPost.querySelector('button');
	var limitLbl = newPost.querySelector('label[for="text_post_message"]');

	function resetLatestPost() {
		var latest = document.querySelectorAll('.latest-post');

		for (let i = 0; i < latest.length; i++) {
			latest[i].classList.remove('latest-post');
			latest[i].classList.remove('fade-in');
		}
	}

	function updatePostTimes() {
		var postArr = _this.container.querySelectorAll('.post');
		var postTimestamp;
		var timestamp;

		for (let i = 0; i < postArr.length; i++) {
			postTimestamp = postArr[i].querySelector(
				'.post-user--posted_info-timestamp'
			);
			timestamp = parseInt(postTimestamp.getAttribute('data-ts'));
			postTimestamp.innerHTML = _this.timeSince(timestamp);
		}
	}

	function textAreaHandler() {
		var length = this.value.length;
		var charsRemaining = 140 - length;

		limitLbl.innerHTML = charsRemaining;

		if (length > 140) {
			newPost.classList.add('warning');
			postBtn.setAttribute('disabled', true);
		} else {
			newPost.classList.remove('warning');
			postBtn.removeAttribute('disabled');
		}
	}

	message.addEventListener('drop', function(e) {
		e.stopPropagation();
		e.preventDefault();

		var selected_file = e.dataTransfer.files[0];
		this.value = this.value + ' ' + selected_file.name;
	});

	postBtn.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();

		var now = new Date();
		var timestamp = now.getTime() / 1000;
		var photos = [];
		var newPost;
		var photos = message.value.match(
			/(?=\w)([\w\/]+(?:.png|.jpg|.jpeg|.gif))|([.\~\-\:\w\/]+(?:.png|.jpg|.jpeg‌​|.gif))/gim
		);

		newPost = {
			id: parseInt(_this.lastPostId) + 1,
			user: 4,
			photos: photos,
			message: message.value,
			ts: timestamp
		};

		if (message.value.length > 0 && message.value.length <= 140) {
			if (message.classList.contains('reply')) {
				newPost.reply_to = parseInt(_this.replyId);
				message.classList.remove('reply');
				_this.replyId = null;
				_this.callback();
			}

			_this.posts.push(newPost);

			resetLatestPost();
			updatePostTimes();

			_this.storeData('posts');
			_this.postIt(newPost, true);
			message.value = '';
			limitLbl.innerHTML = '140';
		} else {
			alert('Message is limited to 140 characters.');
		}
	});

	message.addEventListener('keydown', textAreaHandler, true);
	message.addEventListener('keypress', textAreaHandler, true);
	message.addEventListener('keyup', textAreaHandler, true);
};

Microblog.prototype.init = function() {
	if (
		typeof window.orientation !== 'undefined' ||
		navigator.userAgent.match(
			/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i
		)
	) {
		document.getElementsByTagName('body')[0].classList.add('mobile');
	}

	// Get Data from Session Cache
	this.getData('users');

	// On load, this is the user logged in.
	this.users['4'] = {
		username: 'bettermortgage',
		real_name: 'Better Mortgage',
		verified: true
	};

	// Add Users in Session Cache
	this.storeData('users');

	// Define the current user who is logged in (should be provided by API)
	this.currentUser.username = this.users['4'].username;
	this.currentUser.id = 4;

	// Load pre-existing posts
	this.createPosts();

	// Bind events to new post form and post replies
	this.bindEvents();
};

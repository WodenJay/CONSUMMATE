/*
	Telephasic by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body');

	// Breakpoints.
		breakpoints({
			normal:    [ '1081px',  '1280px'  ],
			narrow:    [ '821px',   '1080px'  ],
			narrower:  [ '737px',   '820px'   ],
			mobile:    [ '481px',   '736px'   ],
			mobilep:   [ null,      '480px'   ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Dropdowns.
		$('#nav > ul').dropotron({
			mode: 'fade',
			speed: 300,
			alignment: 'center',
			noOpenerFade: true
		});

	// Nav.

		// Button.
			$(
				'<div id="navButton">' +
					'<a href="#navPanel" class="toggle"></a>' +
				'</div>'
			)
				.appendTo($body);

		// Panel.
			$(
				'<div id="navPanel">' +
					'<nav>' +
						'<a href="index.html" class="link depth-0">Home</a>' +
						$('#nav').navList() +
					'</nav>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					resetScroll: true,
					resetForms: true,
					side: 'top',
					target: $body,
					visibleClass: 'navPanel-visible'
				});

})(jQuery);

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

function initAnimations() {
    // 标题动画
    gsap.from("#hero h2", {
        duration: 1.5,
        y: 50,
        opacity: 0,
        ease: "back.out(1.7)"
    });

    // 按钮动画
    gsap.from(".button", {
        scrollTrigger: {
            trigger: ".button",
            start: "top 80%"
        },
        duration: 0.8,
        scale: 0.5,
        opacity: 0,
        ease: "elastic.out(1, 0.5)"
    });

    // 内容区域视差效果
    gsap.utils.toArray(".feature").forEach((section, i) => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 75%"
            },
            duration: 0.8,
            y: 50,
            opacity: 0,
            stagger: 0.1,
            ease: "power1.out"
        });
    });

    // 文字惯性效果 - 优化版
    const textElements = document.querySelectorAll("h1, h2, h3, p");
    textElements.forEach(text => {
        gsap.from(text, {
            scrollTrigger: {
                trigger: text,
                start: "top 80%",  // 更早触发
                end: "top 30%",    // 更快完成
                scrub: 0.5         // 减少拖拽感
            },
            y: 30,                // 减少移动距离
            opacity: 0.7,          // 初始透明度提高
            ease: "power1.out",    // 更平滑的缓动
            duration: 0.5          // 缩短动画时间
        });
    });
}

// Chat System Functionality
$(document).ready(function() {
    initAnimations();
    let currentMode = 'general';
    const chatMessages = $('#chat-messages');
    const userInput = $('#user-input');
    const sendButton = $('#send-button');

    // Handle mode selection
    $('.mode-button').on('click', function(e) {
        e.preventDefault();
        currentMode = $(this).data('mode');
        const modeName = $(this).text();
        let promptMessage = `已切换到${modeName}方法`;
        
        // Add specific prompts for each mode
        switch(currentMode) {
            case 'general':
                promptMessage += " - 标准对话模式";
                break;
            case 'creative':
                promptMessage += " - 角色扮演模式";
                break;
            case 'technical':
                promptMessage += " - 技术专家模式";
                break;
            case 'custom':
                promptMessage += " - 自定义模式";
                break;
        }
        
        addSystemMessage(promptMessage);
    });

    // Handle send message
    sendButton.on('click', function(e) {
        e.preventDefault();
        sendMessage();
    });
    
    userInput.on('keypress', function(e) {
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function sendMessage() {
        const message = userInput.val().trim();
        if (message) {
            addUserMessage(message);
            userInput.val('');
            
            // Call Python backend API
            callPythonAPI(currentMode, message)
                .then(response => {
                    addBotMessage(response);
                })
                .catch(error => {
                    addSystemMessage('请求失败: ' + error);
                });
        }
    }

    function callPythonAPI(mode, message) {
        return new Promise((resolve, reject) => {
            // 根据模式选择对应的Python脚本
            const apiUrl = `/api/${mode}`;
            
            $.ajax({
                url: apiUrl,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    message: message,
                    timestamp: new Date().getTime()
                }),
                success: function(data) {
                    if (data.success) {
                        resolve(data.response);
                    } else {
                        reject(data.error || '未知错误');
                    }
                },
                error: function(xhr, status, error) {
                    let errorMsg = '请求失败';
                    if (xhr.responseJSON && xhr.responseJSON.error) {
                        errorMsg = xhr.responseJSON.error;
                    } else if (error) {
                        errorMsg = error;
                    }
                    reject(errorMsg);
                }
            });
        });
    }

    function addUserMessage(text) {
        addMessage('user', text);
    }

    function addBotMessage(text) {
        addMessage('bot', text);
    }

    function addSystemMessage(text) {
        addMessage('system', text);
    }

    function addMessage(type, text) {
        const messageElement = $('<div class="message ' + type + '">' + text + '</div>');
        chatMessages.append(messageElement);
        chatMessages.scrollTop(chatMessages[0].scrollHeight);
    }
});


/* Developed by Noura Bensaber */

(function($) {

    function __tooltipdata(elem, options) {
        var that = this;
        this.id = options.id;
        this.title = options.title;
        this.customClass = options.customClass;
        this.containerClass = options.containerClass;
        this.tooltipImgClass = options.tooltipImgClass;
        this.headerClass = options.headerClass;
        this.menuClass = options.menuClass;
        this.contentClass = options.contentClass;
        this.footerClass = options.footerClass;
        this.image = options.image || "";
        this.info_head = options.info_head;
        this.info_foot = options.info_foot;
        this.info_menu = options.info_menu;
        this.imageurl = options.imageurl;

        this.position = options.position || {
                                            my: "center bottom", // Position the tooltip relative to the element
                                            at: "center top",    // Position tooltip above the element
                                            collision: "flip"    // Adjust positioning to prevent clipping
                                         };
        this.show = options.show || {effect: "slideDown", duration: 200};
        this.hide = options.hide || {effect: "slideUp", duration: 200};
        this.track = options.track || false;
        this.classes = options.classes || {"ui-tooltip": "highlight"};
        this.isOpened = false;

        this.content = $("<div class='" + this.containerClass + "'></div>");
        this.headerContainer = $("<div class='" + this.headerClass + "'></div>");
        this.menuContainer = $("<div class='" + this.menuClass + "'></div>");
        this.imageContainer = $("<div class='" + this.contentClass + "'></div>");
        this.footerContainer = $("<div class='" + this.footerClass + "'></div>");
        this.tooltipImg = $("<img class='" + this.tooltipImgClass + "' src='" + options.image + "'>");
        this.imageContainer.append(this.tooltipImg);

        this.infoHeadSpan = $("<div>" + options.info_head + "</div>");
        this.headerContainer.append(this.infoHeadSpan);

        this.infoMenuSpan = $("<div>" + options.info_menu + "</div>");
        this.menuContainer.append(this.infoMenuSpan);

        this.infoFootSpan = $("<div>" + options.info_foot + "</div>");
        this.footerContainer.append(this.infoFootSpan);

        this.content.append(this.headerContainer);
        this.content.append(this.menuContainer);
        this.content.append(this.imageContainer);
        this.content.append(this.footerContainer);

        // Cache object to store images
        this.imageCache = __tooltipdata.imageCache || (__tooltipdata.imageCache = {});

        // This code snippet prevents the tooltip from hiding
        //when the mouse is moved out of the element
        $(elem).on('mouseout focusout', function(event) {
			event.stopImmediatePropagation();
		});

		$(elem).click(function () {
            if (that.title) {
                if (that.isOpened) {
                    that.isOpened = false;
                    // Hide the tooltip using the API
                    $(elem).tooltip("disable");
                } else {
                    that.isOpened = true;
                    // Temporarily update the title and enable the tooltip
                    $(elem).attr("title", that.title).tooltip("enable");
                    // Show the tooltip programmatically
                    $(elem).tooltip("open");
                }
            }
        });

        this.onOpen = function() {
            if (that.image) return;

            if (that.imageCache[that.id]) {
                that.image = that.imageCache[that.id];
                that.tooltipImg.attr("src", that.image);
            } else {
                $.ajax({
                    type: 'POST',
                    url: that.imageurl,
                    dataType: 'binary',
                    processData: false,
                    contentType: 'application/json',
                    xhrFields: { responseType: 'blob' },
                    data: JSON.stringify({ 'id': that.id }),
                    success: function(blob) {
                        // Create a URL for the blob
                        var imageUrl = URL.createObjectURL(blob);
                        that.image = imageUrl;
                        // Cache the image
                        that.imageCache[that.id] = imageUrl;
                        // Set the src attribute of the img element
                        that.tooltipImg.attr("src", imageUrl);
                    },
                    error: function(xhr, status, error) {
                        console.error("Error: ", error, "Status: ", status);
                    }
                });
            }

        }

        elem.tooltip({
            content: that.content, // Custom content for the tooltip
            position: that.position,
            show: that.show,
            hide: that.hide,
            track: that.track,
            classes: that.classes,
            open: function(event, ui) {
                that.onOpen();
            },
        });
    }

    $.fn.tooltipData = function(data) {
        return this.each(function() {
            // Check if the element already has tooltip data initialized
            if (!$.data(this, "tooltipdata")) {
                // Initialize the tooltip data and store it in the element's data
                $.data(this, "tooltipdata", new __tooltipdata($(this), data));
            }
        });
    };
}(jQuery));
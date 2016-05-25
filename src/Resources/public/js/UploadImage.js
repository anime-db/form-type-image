/*global jQuery:false, alert:false */

/*
 * Default text - jQuery plugin for html5 dragging files from desktop to browser
 *
 * Author: Weixi Yen
 *
 * Email: [Firstname][Lastname]@gmail.com
 *
 * Copyright (c) 2010 Resopollution
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.github.com/weixiyen/jquery-filedrop
 *
 * Version:  0.1.0
 *
 * Features:
 *      Allows sending of extra parameters with file.
 *      Works with Firefox 3.6+
 *      Future-compliant with HTML5 spec (will work with Webkit browsers and IE9)
 * Usage:
 *  See README at project homepage
 *
 */
;(function($) {

  jQuery.event.props.push("dataTransfer");

  var default_opts = {
      fallback_id: '',
      url: '',
      refresh: 1000,
      paramname: 'userfile',
      requestType: 'POST',    // just in case you want to use another HTTP verb
      allowedfileextensions:[],
      allowedfiletypes:[],
      maxfiles: 25,           // Ignored if queuefiles is set > 0
      maxfilesize: 1,         // MB file size limit
      queuefiles: 0,          // Max files before queueing (for large volume uploads)
      queuewait: 200,         // Queue wait time if full
      data: {},
      headers: {},
      drop: empty,
      dragStart: empty,
      dragEnter: empty,
      dragOver: empty,
      dragLeave: empty,
      docEnter: empty,
      docOver: empty,
      docLeave: empty,
      beforeEach: empty,
      afterAll: empty,
      rename: empty,
      error: function(err, file, i, status) {
        alert(err);
      },
      uploadStarted: empty,
      uploadFinished: empty,
      progressUpdated: empty,
      globalProgressUpdated: empty,
      speedUpdated: empty
      },
      errors = ["BrowserNotSupported", "TooManyFiles", "FileTooLarge", "FileTypeNotAllowed", "NotFound", "NotReadable", "AbortError", "ReadError", "FileExtensionNotAllowed"];

  $.fn.filedrop = function(options) {
    var opts = $.extend({}, default_opts, options),
        global_progress = [],
        doc_leave_timer, stop_loop = false,
        files_count = 0,
        files;

    $('#' + opts.fallback_id).css({
      display: 'none',
      width: 0,
      height: 0
    });

    this.on('drop', drop).on('dragstart', opts.dragStart).on('dragenter', dragEnter).on('dragover', dragOver).on('dragleave', dragLeave);
    $(document).on('drop', docDrop).on('dragenter', docEnter).on('dragover', docOver).on('dragleave', docLeave);

    this.on('click', function(e){
      $('#' + opts.fallback_id).trigger(e);
    });

    $('#' + opts.fallback_id).change(function(e) {
      opts.drop(e);
      files = e.target.files;
      files_count = files.length;
      upload();
    });

    function drop(e) {
      if( opts.drop.call(this, e) === false ) return false;
      if(!e.dataTransfer)
        return;
      files = e.dataTransfer.files;
      if (files === null || files === undefined || files.length === 0) {
        opts.error(errors[0]);
        return false;
      }
      files_count = files.length;
      upload();
      e.preventDefault();
      return false;
    }

    function getBuilder(filename, filedata, mime, boundary) {
      var dashdash = '--',
          crlf = '\r\n',
          builder = '',
          paramname = opts.paramname;

      if (opts.data) {
        var params = $.param(opts.data).replace(/\+/g, '%20').split(/&/);

        $.each(params, function() {
          var pair = this.split("=", 2),
              name = decodeURIComponent(pair[0]),
              val  = decodeURIComponent(pair[1]);

          if (pair.length !== 2) {
              return;
          }

          builder += dashdash;
          builder += boundary;
          builder += crlf;
          builder += 'Content-Disposition: form-data; name="' + name + '"';
          builder += crlf;
          builder += crlf;
          builder += val;
          builder += crlf;
        });
      }

      if (jQuery.isFunction(paramname)){
        paramname = paramname(filename);
      }

      builder += dashdash;
      builder += boundary;
      builder += crlf;
      builder += 'Content-Disposition: form-data; name="' + (paramname||"") + '"';
      builder += '; filename="' + encodeURIComponent(filename) + '"';
      builder += crlf;

      builder += 'Content-Type: ' + mime;
      builder += crlf;
      builder += crlf;

      builder += filedata;
      builder += crlf;

      builder += dashdash;
      builder += boundary;
      builder += dashdash;
      builder += crlf;
      return builder;
    }

    function progress(e) {
      if (e.lengthComputable) {
        var percentage = Math.round((e.loaded * 100) / e.total);
        if (this.currentProgress !== percentage) {

          this.currentProgress = percentage;
          opts.progressUpdated(this.index, this.file, this.currentProgress);

          global_progress[this.global_progress_index] = this.currentProgress;
          globalProgress();

          var elapsed = new Date().getTime();
          var diffTime = elapsed - this.currentStart;
          if (diffTime >= opts.refresh) {
            var diffData = e.loaded - this.startData;
            var speed = diffData / diffTime; // KB per second
            opts.speedUpdated(this.index, this.file, speed);
            this.startData = e.loaded;
            this.currentStart = elapsed;
          }
        }
      }
    }

    function globalProgress() {
      if (global_progress.length === 0) {
        return;
      }

      var total = 0, index;
      for (index in global_progress) {
        if(global_progress.hasOwnProperty(index)) {
          total = total + global_progress[index];
        }
      }

      opts.globalProgressUpdated(Math.round(total / global_progress.length));
    }

    // Respond to an upload
    function upload() {
      stop_loop = false;

      if (!files) {
        opts.error(errors[0]);
        return false;
      }

      if (opts.allowedfiletypes.push && opts.allowedfiletypes.length) {
        for(var fileIndex = files.length;fileIndex--;) {
          if(!files[fileIndex].type || $.inArray(files[fileIndex].type, opts.allowedfiletypes) < 0) {
            opts.error(errors[3], files[fileIndex]);
            return false;
          }
        }
      }

      if (opts.allowedfileextensions.push && opts.allowedfileextensions.length) {
        for(var fileIndex = files.length;fileIndex--;) {
          var allowedextension = false;
          for (i=0;i<opts.allowedfileextensions.length;i++){
            if (files[fileIndex].name.substr(files[fileIndex].name.length-opts.allowedfileextensions[i].length).toLowerCase()
                    == opts.allowedfileextensions[i].toLowerCase()
            ) {
              allowedextension = true;
            }
          }
          if (!allowedextension){
            opts.error(errors[8], files[fileIndex]);
            return false;
          }
        }
      }

      var filesDone = 0,
          filesRejected = 0;

      if (files_count > opts.maxfiles && opts.queuefiles === 0) {
        opts.error(errors[1]);
        return false;
      }

      // Define queues to manage upload process
      var workQueue = [];
      var processingQueue = [];
      var doneQueue = [];

      // Add everything to the workQueue
      for (var i = 0; i < files_count; i++) {
        workQueue.push(i);
      }

      // Helper function to enable pause of processing to wait
      // for in process queue to complete
      var pause = function(timeout) {
        setTimeout(process, timeout);
        return;
      };

      // Process an upload, recursive
      var process = function() {

        var fileIndex;

        if (stop_loop) {
          return false;
        }

        // Check to see if are in queue mode
        if (opts.queuefiles > 0 && processingQueue.length >= opts.queuefiles) {
          return pause(opts.queuewait);
        } else {
          // Take first thing off work queue
          fileIndex = workQueue[0];
          workQueue.splice(0, 1);

          // Add to processing queue
          processingQueue.push(fileIndex);
        }

        try {
          if (beforeEach(files[fileIndex]) !== false) {
            if (fileIndex === files_count) {
              return;
            }
            var reader = new FileReader(),
                max_file_size = 1048576 * opts.maxfilesize;

            reader.index = fileIndex;
            if (files[fileIndex].size > max_file_size) {
              opts.error(errors[2], files[fileIndex], fileIndex);
              // Remove from queue
              processingQueue.forEach(function(value, key) {
                if (value === fileIndex) {
                  processingQueue.splice(key, 1);
                }
              });
              filesRejected++;
              return true;
            }

            reader.onerror = function(e) {
                switch(e.target.error.code) {
                    case e.target.error.NOT_FOUND_ERR:
                        opts.error(errors[4]);
                        return false;
                    case e.target.error.NOT_READABLE_ERR:
                        opts.error(errors[5]);
                        return false;
                    case e.target.error.ABORT_ERR:
                        opts.error(errors[6]);
                        return false;
                    default:
                        opts.error(errors[7]);
                        return false;
                };
            };

            reader.onloadend = !opts.beforeSend ? send : function (e) {
              opts.beforeSend(files[fileIndex], fileIndex, function () { send(e); });
            };

            reader.readAsDataURL(files[fileIndex]);

          } else {
            filesRejected++;
          }
        } catch (err) {
          // Remove from queue
          processingQueue.forEach(function(value, key) {
            if (value === fileIndex) {
              processingQueue.splice(key, 1);
            }
          });
          opts.error(errors[0]);
          return false;
        }

        // If we still have work to do,
        if (workQueue.length > 0) {
          process();
        }
      };

      var send = function(e) {

        var fileIndex = (e.srcElement || e.target).index;

        // Sometimes the index is not attached to the
        // event object. Find it by size. Hack for sure.
        if (e.target.index === undefined) {
          e.target.index = getIndexBySize(e.total);
        }

        var xhr = new XMLHttpRequest(),
            upload = xhr.upload,
            file = files[e.target.index],
            index = e.target.index,
            start_time = new Date().getTime(),
            boundary = '------multipartformboundary' + (new Date()).getTime(),
            global_progress_index = global_progress.length,
            builder,
            newName = rename(file.name),
            mime = file.type;

        if (opts.withCredentials) {
          xhr.withCredentials = opts.withCredentials;
        }

        var data = atob(e.target.result.split(',')[1]);
        if (typeof newName === "string") {
          builder = getBuilder(newName, data, mime, boundary);
        } else {
          builder = getBuilder(file.name, data, mime, boundary);
        }

        upload.index = index;
        upload.file = file;
        upload.downloadStartTime = start_time;
        upload.currentStart = start_time;
        upload.currentProgress = 0;
        upload.global_progress_index = global_progress_index;
        upload.startData = 0;
        upload.addEventListener("progress", progress, false);

        // Allow url to be a method
        if (jQuery.isFunction(opts.url)) {
            xhr.open(opts.requestType, opts.url(), true);
        } else {
            xhr.open(opts.requestType, opts.url, true);
        }

        xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        // Add headers
        $.each(opts.headers, function(k, v) {
          xhr.setRequestHeader(k, v);
        });

          if(!xhr.sendAsBinary){
              xhr.sendAsBinary = function(datastr) {
                  function byteValue(x) {
                      return x.charCodeAt(0) & 0xff;
                  }
                  var ords = Array.prototype.map.call(datastr, byteValue);
                  var ui8a = new Uint8Array(ords);
                  this.send(ui8a.buffer);
              }
          }
          
        xhr.sendAsBinary(builder);

        global_progress[global_progress_index] = 0;
        globalProgress();

        opts.uploadStarted(index, file, files_count);

        xhr.onload = function() {
            var serverResponse = null;

            if (xhr.responseText) {
              try {
                serverResponse = jQuery.parseJSON(xhr.responseText);
              }
              catch (e) {
                serverResponse = xhr.responseText;
              }
            }

            var now = new Date().getTime(),
                timeDiff = now - start_time,
                result = opts.uploadFinished(index, file, serverResponse, timeDiff, xhr);
            filesDone++;

            // Remove from processing queue
            processingQueue.forEach(function(value, key) {
              if (value === fileIndex) {
                processingQueue.splice(key, 1);
              }
            });

            // Add to donequeue
            doneQueue.push(fileIndex);

            // Make sure the global progress is updated
            global_progress[global_progress_index] = 100;
            globalProgress();

            if (filesDone === (files_count - filesRejected)) {
              afterAll();
            }
            if (result === false) {
              stop_loop = true;
            }


          // Pass any errors to the error option
          if (xhr.status < 200 || xhr.status > 299) {
            opts.error(xhr.statusText, file, fileIndex, xhr.status);
          }
        };
      };

      // Initiate the processing loop
      process();
    }

    function getIndexBySize(size) {
      for (var i = 0; i < files_count; i++) {
        if (files[i].size === size) {
          return i;
        }
      }

      return undefined;
    }

    function rename(name) {
      return opts.rename(name);
    }

    function beforeEach(file) {
      return opts.beforeEach(file);
    }

    function afterAll() {
      return opts.afterAll();
    }

    function dragEnter(e) {
      clearTimeout(doc_leave_timer);
      e.preventDefault();
      opts.dragEnter.call(this, e);
    }

    function dragOver(e) {
      clearTimeout(doc_leave_timer);
      e.preventDefault();
      opts.docOver.call(this, e);
      opts.dragOver.call(this, e);
    }

    function dragLeave(e) {
      clearTimeout(doc_leave_timer);
      opts.dragLeave.call(this, e);
      e.stopPropagation();
    }

    function docDrop(e) {
      e.preventDefault();
      opts.docLeave.call(this, e);
      return false;
    }

    function docEnter(e) {
      clearTimeout(doc_leave_timer);
      e.preventDefault();
      opts.docEnter.call(this, e);
      return false;
    }

    function docOver(e) {
      clearTimeout(doc_leave_timer);
      e.preventDefault();
      opts.docOver.call(this, e);
      return false;
    }

    function docLeave(e) {
      doc_leave_timer = setTimeout((function(_this) {
        return function() {
          opts.docLeave.call(_this, e);
        };
      })(this), 200);
    }

    return this;
  };

  function empty() {}

  try {
    if (XMLHttpRequest.prototype.sendAsBinary) {
        return;
    }
    XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
      function byteValue(x) {
        return x.charCodeAt(0) & 0xff;
      }
      var ords = Array.prototype.map.call(datastr, byteValue);
      var ui8a = new Uint8Array(ords);

      // Not pretty: Chrome 22 deprecated sending ArrayBuffer, moving instead
      // to sending ArrayBufferView.  Sadly, no proper way to detect this
      // functionality has been discovered.  Happily, Chrome 22 also introduced
      // the base ArrayBufferView class, not present in Chrome 21.
      if ('ArrayBufferView' in window)
        this.send(ui8a);
      else
        this.send(ui8a.buffer);
    };
  } catch (e) {}

})(jQuery);

/**
 * AnimeDb package
 *
 * @package   AnimeDb
 * @author    Peter Gribanov <info@peter-gribanov.ru>
 * @copyright Copyright (c) 2016, Peter Gribanov
 * @license   http://opensource.org/licenses/MIT
 */

(function($){

    var extend = function(Child, Parent) {
        var F = function() {};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        Child.superclass = Parent.prototype;
    };



    /**
     * Controller control
     * @constructor
     */
    var ControllerControl = function() {
        this._controller = null; // private
    };
    ControllerControl.prototype = {
        setController: function(controller) {
            this._controller = controller;
        },
        getController: function() {
            return this._controller;
        },
        bind: function() {
            throw new Error('Must be implemented');
        }
    };



    /**
     * Controller
     * @param token
     * @constructor
     */
    var Controller = function(token) {
        this._controls = []; // private
        this._token = token; // private
    };
    Controller.prototype = {
        addControl: function(name, control) {
            if (control instanceof ControllerControl) {
                control.setController(this);
                this._controls[name] = control;
            }
        },
        bindControl: function(target) {
            var name = target.data('control');
            if (this._controls[name] instanceof ControllerControl) {
                this._controls[name].bind(target);
            }
        },
        bind: function(target) {
            target = $(target || 'body');

            if (target.data('control')) {
                this.bindControl(target);
            } else {
                var that = this;
                target.find('[data-control]').each(function () {
                    that.bindControl($(this));
                });
            }
        },
        getToken: function() {
            return this._token;
        }
    };



    /**
     * Util for get CSRF token
     * @constructor
     */
    var UtilFormToken = function() {
        this._token = ''; // private
        this._url = ''; // private
        this._wait = false; // private
    };
    UtilFormToken.prototype = {
        getToken: function() {
            return this._token;
        },
        setUrl: function(url) {
            this._url = url;
            if (url && !this._token) {
                this.refreshToken();
            }
        },
        refreshToken: function(callback) {
            if (!this._wait && this._url) {
                this._wait = true;
                var that = this;
                $.ajax({
                    url: this._url,
                    type: 'POST',
                    dataType: 'text',
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        that._token = response;
                        that._wait = false;
                        (callback || function () {})();
                    },
                    complete: function() {
                        that._wait = false;
                    }
                });
            }
        }
    };



    /**
     * Upload image container
     * @param target
     * @param control
     * @constructor
     */
    var ControlUploadImageContainer = function(target, control) {
        this._control = control; // private
        this.image = null;
        this.input = null;
        this.file = null;
        this.container = target;
        this.path = target.data('upload-path');
        this.error = $('<div class="upload-image__alert alert alert-danger" role="alert"></div>').hide();
        this.container.after(this.error);
    };
    ControlUploadImageContainer.prototype = {
        init: function() {
            this.image = this.container.find('img');
            this.input = this.container.find('input[type=text]');
            this.file = this.container.find('input[type=file]');

            var that = this;
            this.fileDropBlock();
            this.file.on('change', function () {
                that.doUpload(this.files[0]);
            });
        },
        /**
         * FileDrop upload
         * @link https://github.com/weixiyen/jquery-filedrop
         */
        fileDropBlock: function() {
            var that = this;
            this.container.filedrop({
                url: that.path,
                paramname: 'form[file]',
                data: {
                    form: {
                        _token: function() {
                            return that._control.getController().getToken().getToken();
                        }
                    }
                },
                maxfiles: 1,
                maxfilesize: 2, // max file size in MB
                error: function (err) {
                    switch (err) {
                        case 'BrowserNotSupported':
                            that.showError('Browser not supported');
                            break;
                        case 'FileTooLarge':
                            that.showError('File too large');
                            break;
                        case 'TooManyFiles':
                            that.showError('You can upload only 1 file');
                            break;
                        case 'FileTypeNotAllowed':
                            that.showError('Invalid file type');
                            break;
                        default:
                            that.showError('Failed to upload image');
                    }
                },
                allowedfiletypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedfileextensions: ['.jpg', '.jpeg', '.png', '.gif'],
                dragOver: function () {
                    that.container.addClass('upload-image_dragging');
                },
                dragLeave: function () {
                    that.container.removeClass('upload-image_dragging');
                },
                uploadStarted: function () {
                    that.container.removeClass('upload-image_dragging');
                    that.error.hide();
                },
                uploadFinished: function (i, file, response) {
                    that.setInputValueFromResponse(response);
                }
            });
        },
        /**
         * Upload for click on file input
         * @param file
         */
        doUpload: function(file) {
            this.error.hide();
            var reader;

            if (window.FormData) {
                formdata = new FormData();
            }

            if (window.FileReader) {
                reader = new FileReader();
                reader.readAsDataURL(file);
            }

            if (formdata) {
                formdata.append('form[file]', file);
                formdata.append('form[_token]', this._control.getController().getToken().getToken());
            }

            if ($.inArray(file.type, ['image/jpeg', 'image/png', 'image/gif']) != -1) {
                var that = this;
                $.ajax({
                    url: that.path,
                    type: 'POST',
                    data: formdata,
                    dataType: 'json',
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        if (response.status == 0) {
                            that.showError(response.message);
                        } else {
                            that.setInputValueFromResponse(response);
                        }
                        that._control.getController().getToken().refreshToken();
                    }
                });
            } else {
                this.showError('Invalid file type');
            }
            this.file.blur();
        },
        setInputValueFromResponse: function(response) {
            this.input.val(response.filename);
            this.image.attr('src', response.web_path);
        },
        showError: function(message) {
            console.error(message);
            this.error.text(message).show();
        }
    };



    /**
     * Control upload image
     * @constructor
     */
    var ControlUploadImage = function() {
    };
    extend(ControlUploadImage, ControllerControl);
    ControlUploadImage.prototype.bind = function(target) {
        this._controller.getToken().setUrl(target.data('generate-token'));

        (new ControlUploadImageContainer(target, this)).init();
    };



    /**
     * Upload image collection container
     * @param target
     * @param control
     * @constructor
     */
    var ControlUploadImageCollectionContainer = function(target, control) {
        this._control = control; // private
        this._drop_block = target.find(target.data('drop-block')); // private
        this._single_upload_path = target.data('single-upload-path'); // private
        this._milti_upload_path = target.data('milti-upload-path'); // private
        this._limit = target.data('upload-limit'); // private
        this._container = target.find(target.data('container')); // private
        this._file = this._drop_block.find('input[type=file]'); // private
        this._error = $('<div class="form-image-collection__alert alert alert-danger" role="alert"></div>').hide(); // private
    };
    ControlUploadImageCollectionContainer.prototype = {
        init: function () {
            this._drop_block.before(this._error);

            var that = this;
            this.fileDropBlock();
            this._file.on('change', function () {
                that.doUpload(this);
            });
        },
        /**
         * FileDrop upload
         * @link https://github.com/weixiyen/jquery-filedrop
         */
        fileDropBlock: function () {
            var that = this;
            this._drop_block.filedrop({
                url: that._single_upload_path,
                paramname: 'form[file]',
                data: {
                    form: {
                        _token: function () {
                            return that._control.getController().getToken().getToken();
                        }
                    }
                },
                maxfiles: this._limit,
                maxfilesize: 2, // max file size in MB
                error: function (err) {
                    switch (err) {
                        case 'BrowserNotSupported':
                            that.showError('Browser not supported');
                            break;
                        case 'FileTooLarge':
                            that.showError('Files too large');
                            break;
                        case 'TooManyFiles':
                            that.showError('You can upload only ' + that._limit + ' files');
                            break;
                        case 'FileTypeNotAllowed':
                            that.showError('Invalid files type');
                            break;
                        default:
                            that.showError('Failed to upload images');
                    }
                },
                allowedfiletypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedfileextensions: ['.jpg', '.jpeg', '.png', '.gif'],
                dragOver: function () {
                    that._drop_block.addClass('form-image-collection_dragging');
                },
                dragLeave: function () {
                    that._drop_block.removeClass('form-image-collection_dragging');
                },
                uploadStarted: function () {
                    that._drop_block.removeClass('form-image-collection_dragging');
                    that._error.hide();
                },
                uploadFinished: function (i, file, response) {
                    that.addFile(response);
                },
                afterAll: function () {
                    that._control.getController().getToken().refreshToken();
                }
            });
        },
        /**
         * Upload for click on file input
         */
        doUpload: function (input_file) {
            this._error.hide();
            if (!input_file.files.length) {
                return;
            }

            if (input_file.files.length > this._limit) {
                this.showError('You can upload only ' + this._limit + ' files');
                return;
            }

            var formdata = window.FormData ? new FormData() : null;
            var reader, file;

            for (var i = 0; i < input_file.files.length; i++) {
                file = input_file.files[i];
                if (window.FileReader) {
                    reader = new FileReader();
                    reader.readAsDataURL(file);
                }

                if (formdata && $.inArray(file.type, ['image/jpeg', 'image/png', 'image/gif']) != -1) {
                    formdata.append('form[files][]', file);
                }
            }

            if (formdata) {
                formdata.append('form[_token]', this._control.getController().getToken().getToken());
                var that = this;
                $.ajax({
                    url: that._milti_upload_path,
                    type: 'POST',
                    data: formdata,
                    dataType: 'json',
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        if (response.status == 1) {
                            that.addFiles(response.files);
                        } else {
                            that.showError(response.message);
                        }
                        that._control.getController().getToken().refreshToken();
                    },
                    error: function () {
                        that.showError('Failed to upload images');
                    }
                });
            } else {
                this.showError('Invalid files type');
            }
            this._file.blur();
        },
        addFiles: function (files) {
            for (var i = 0; i < files.length; i++) {
                this.addFile(files[i]);
            }
        },
        addFile: function (file) {
            this._container.find('.sonata-collection-add').trigger('click');
            // set data
            var row = this._container.find('.sonata-collection-row:last');
            row.find('.upload-image input[type=text]').val(file.filename);
            row.find('.upload-image img').attr('src', file.web_path);
            this._control.getController().bind(row);
        },
        showError: function (message) {
            console.error(message);
            this._error.text(message).show();
            this._file.blur();
        }
    };



    /**
     * Control upload image collection
     * @constructor
     */
    var ControlUploadImageCollection = function() {
    };
    extend(ControlUploadImageCollection, ControllerControl);
    ControlUploadImageCollection.prototype.bind = function(target) {
        this._controller.getToken().setUrl(target.data('generate-token'));

        (new ControlUploadImageCollectionContainer(target, this)).init();
    };



    // init Controller and add controls
    var cont = new Controller(new UtilFormToken());
    cont.addControl('form-image', new ControlUploadImage());
    cont.addControl('form-image-collection', new ControlUploadImageCollection());

    $(function(){
        cont.bind();

        // bind on add element from Sonata
        $('div[id^=sonata-ba-field-container-]').on('sonata.add_element', function(event) {
            cont.bind(event.target);
        });
        $('.sonata-collection-add').on('sonata-collection-item-added', function(event) {
            cont.bind(
                $(event.target).closest('.sonata-ba-field').find('.sonata-collection-row > .row:last-child')
            );
        });
    });

})(jQuery);

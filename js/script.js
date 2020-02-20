$(document).ready(function () {
    window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;


    if (!window.indexedDB) {
        alert('Please update your browser');
    }
    else {
        var check_database = window.indexedDB.databases();
        check_database.then(function (get_pending_obj) {
            if (get_pending_obj.length == 0) {
                main();
            }
            else {
                //retrive songs from database
                var db = window.indexedDB.open('playlist');
                db.onsuccess = function () {
                    var idb = this.result;
                    var permission = idb.transaction('songs', 'readwrite');
                    var access = permission.objectStore('songs');
                    var allKeys = access.getAllKeys();
                    allKeys.onsuccess = function () {
                        var key_array = this.result;
                        var i;
                        if (key_array.length != 0) {
                            for (i = 0; i < key_array.length; i++) {
                                var Allkeys = access.get(key_array[i]);
                                Allkeys.onsuccess = function () {
                                    var key = this.result;
                                    var li = document.createElement('LI');
                                    li.className = 'list-group-item rounded-0';
                                    li.filedata = key.file_data;
                                    li.innerHTML = key.file_name;
                                    $('.list-group').append(li);
                                    li.onclick = function () {
                                        var audio = this.filedata;
                                        var audio_player = document.querySelector('#audio-player');
                                        audio_player.src = audio;
                                        audio_player.play();
                                    }
                                }
                            }
                        }
                        else {
                            alert('no songs found in database');
                        }
                    }
                }
            }
        });
    }
});

function main() {
    var upload_btn = document.querySelector('#upload-btn');
    var audio = document.querySelector('#audio-player');
    var header = document.querySelector('header');
    upload_btn.onclick = function () {
        var file_input = document.createElement('INPUT');
        file_input.type = 'file';
        file_input.accept = '.mp3';
        file_input.click();
        file_input.onchange = function () {
            var file = this.files[0];
            document.querySelector('#song-name').innerHTML = file.name;
            var url = URL.createObjectURL(file);
            audio.src = url;
            audio.play();
        }
    }

    //play pause coding

    audio.onplay = function () {
        $('#playlist').css({
            height: '0%',
            transition: '0.5s'
        });

        $('.playlist-li').addClass('d-none');
        document.querySelector('#play-pause').className = "fa fa-pause-circle";
        header.style.background = "url('image/waves.gif')";
        document.querySelector('#play-pause').onclick = function () {
            audio.pause();
            document.querySelector('#play-pause').className = "fa fa-play-circle";
            header.style.background = "url('image/header.jpg')";
        }
    }

    audio.onpause = function () {
        document.querySelector('#play-pause').className = "fa fa-play-circle";
        header.style.background = "url('image/header.jpg')";
        document.querySelector('#play-pause').onclick = function () {
            audio.play();
            $('#playlist').css({
                height: '0%',
                transition: '0.5s'
            });

            $('.playlist-li').addClass('d-none');
            document.querySelector('#play-pause').className = "fa fa-play-circle";
            header.style.background = "url('image/waves.gif')";
        }
    }

    audio.ontimeupdate = function () {
        var duration = this.duration;
        var current = this.currentTime;
        var percentage = Math.floor((current * 100) / duration);
        var progress_bar = document.querySelector('#progress-bar');
        progress_bar.style.width = percentage + '%';
        document.querySelector('#duration').innerHTML = (current / 60).toFixed(2) + " / " + (duration / 60).toFixed(2);

        var progress = document.querySelector('#progress');
        progress.onclick = function (event) {
            var dist_percen = event.offsetX / this.offsetWidth;
            audio.currentTime = dist_percen * audio.duration;
        }
    }

    //forward backward coding

    $('#forward').on('click',function(){
        var database = window.indexedDB.open('playlist');
        database.onsuccess = function(){
            var idb = this.result;
            var permission = idb.transaction('songs','readwrite');
            var access = permission.objectStore('songs');
            var allKeys = access.getAllKeys();
            allKeys.onsuccess = function(){
                var key_array = this.result;
                var i;
                for(i=0;i<key_array.length;i++){
                    var keys = access.get(key_array[i]);
                    keys.onsuccess = function(){
                        var data = this.result;
                        var audio_player = document.querySelector('#audio-player');
                    }
                }
            }
        }
    });

    //swipe up down coding
    $(document).ready(function () {
        $('#player-box').on('swipeup', function () {
            $('.playlist-li').removeClass('d-none');
            $('#playlist').css({
                height: '100%',
                transition: '0.5s'
            });
        });

        $('#player-box').on('swipedown', function () {
            $('.playlist-li').addClass('d-none');
            $('#playlist').css({
                height: '0%',
                transition: '0.5s'
            });
        });

        //playlist coding

        $('.add').click(function () {
            var input = document.createElement('INPUT');
            input.type = 'file';
            input.accept = '.mp3';
            input.click();
            input.onchange = function () {
                var file = this.files[0];
                var file_name = file.name;
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    var file_data = this.result;
                    var data = {
                        file_data: file_data,
                        file_name: file_name
                    };

                    var db = window.indexedDB.open('playlist');
                    db.onupgradeneeded = function () {
                        var idb = this.result;
                        idb.createObjectStore('songs', { autoIncrement: true });
                    }

                    //add song in database coding
                    db.onsuccess = function () {
                        var idb = this.result;
                        var permission = idb.transaction('songs', 'readwrite');
                        var access = permission.objectStore('songs');
                        var add_data = access.add(data);
                        add_data.onsuccess = function () {
                            alert('uploaded successfully');
                            var li = document.createElement('LI');
                            li.className = 'list-group-item rounded-0';
                            li.innerHTML = file_name;
                            li.filedata = file_data;
                            $('.list-group').append(li);
                            var header = document.querySelector('header');

                            li.onclick = function () {
                                var audio = this.filedata;
                                var audio_player = document.querySelector('#audio-player');
                                audio_player.src = audio;
                                audio_player.play();
                            }
                        }

                        add_data.onerror = function () {
                            alert('some thing went worng !!');
                        }
                    }
                }
            }
        });
    });
}

main();
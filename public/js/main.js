const chatForm = document.getElementById('chat-form');
const message = document.getElementById('chat-messages');
const btnmsg = document.getElementById('msg');
const listUsers = document.getElementById('users');
const userOnline = document.getElementById('user-online');
const nameRoom = document.getElementById('room-name');
let app = document.querySelector('#chat-messages');


const data = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});
const username = data.username;
const room = data.room;
const time = moment().format('hh:m a');
const timestamp = moment().format('h:m:s a');

nameRoom.innerText = room;
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBqn9ULQtJpdZ-MU6jasyfJ_j_6VG3a0KE",
    authDomain: "chat-74ccb.firebaseapp.com",
    databaseURL: "https://chat-74ccb.firebaseio.com",
    projectId: "chat-74ccb",
    storageBucket: "chat-74ccb.appspot.com",
    messagingSenderId: "94645020314",
    appId: "1:94645020314:web:7f4c065330405f438ca123",
    measurementId: "G-16CR1MDHCV"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Gui tin nhan
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Lay tin nhan tu form send
    const msg = document.getElementById('msg').value;
    db.ref(room + '/message').push().set({
        "sender": username,
        "message": msg,
        "date": time
    });

});

let currentPage = 1;

function test() {
    if (document.getElementById("chat-messages").scrollTop == 0) {
        //  const data1 = data.val();
        //  const data2 = Object.keys(data1);
        // -MFFF2uVMDHll33KF5id :  key lay duoc tu data2
        db.ref(room + "/message")
            .on('value', function (snapshot) {
                const data1 = snapshot.val();
                //data3 : lay value trong node con message
                const data3 = Object.values(data1);
                //data2 : lay key (key random) trong node con message
                const data2 = Object.keys(data1);
                const length = data2.length - 1;
                const perPage = 10;
                /*console.log(data3[length-getPage().page]);
                length-getPage().page : lay key 0-14 trong mang data2 va data3
                data2[length-getPage().page] la key/node trong message*/

                if (currentPage < getNumberPage(length, perPage)) {
                    db.ref(room + "/message").orderByChild('date')
                        .endAt(data3[length - getPage(currentPage+1, perPage, length).page].date,
                            data2[length - getPage(currentPage+1, perPage, length).page]).limitToLast(getPage(currentPage, perPage, length).perPage)
                        .on('child_added', function (snapshot) {
                            const data1 = snapshot.val();
                            let className = '';
                            if (data1.sender == username) {
                                className = 'username';
                            }

                            const html =  '<div class="message ' + className + '" id="message ">' +
                                '<p class="meta">' + data1.sender + ' <span>' + data1.date + '</span></p>' +
                                '<p class="text">' + data1.message + '</p>' +
                                '</div>';
                            $(document).ready(function(){
                                $('#chat-messages').prepend(html);
                            });
                        });
                } else {
                    $(document).ready(function(){
                        if (!$('#chat-messages').find(".end-session").length){
                            $('#chat-messages').prepend("<p class='end-session'>End</p>")
                        } else{
                            return false;
                        }
                    });

                }
                currentPage++;
            });

    }
}

/*db.ref(room + "/message")
    .on('value', function (snapshot) {
        const data1 = snapshot.val();

        //data3 : lay value trong node con message
        const data3 = Object.values(data1);

        //data2 : lay key (key random) trong node con message
        const data2 = Object.keys(data1);
        const length = data2.length - 1;
        const perPage = 10;
        console.log(data1);
        db.ref(room + "/message").orderByChild('date')
            .limitToLast(getPage(2, perPage, length).perPage)
            .on('child_added', function (snapshot) {
                const data1 = snapshot.val();
                console.log(data1);
                //console.log(data1);
                /!*let className = '';
                if (data1.sender == username) {
                    className = 'username';
                }

                message.innerHTML +=
                    '<div class="message ' + className + '" id="message ">' +
                    '<p class="meta">' + data1.sender + ' <span>' + data1.date + '</span></p>' +
                    '<p class="text">' + data1.message + '</p>' +
                    '</div>';
                btnmsg.value = '';
                message.scrollTop = message.scrollHeight;*!/

            });
    });*/

// Lấy ra tin nhắn hiển thị ban đầu
db.ref(room + "/message").limitToLast(10).on("child_added", function (data) {
    const data1 = data.val();
    let className = '';
    if (data1.sender == username) {
        className = 'username';
    }
    // console.log(data1);
    message.innerHTML +=
        '<div class="message ' + className + '" id="message ">' +
        '<p class="meta">' + data1.sender + ' <span>' + data1.date + '</span></p>' +
        '<p class="text">' + data1.message + '</p>' +
        '</div>';
    btnmsg.value = '';
    message.scrollTop = message.scrollHeight;

});

// Theo dõi trang thái trên trình duyệt
const myConnectionsRef = db.ref('users/' + room + '/' + username + '/connections');

// Lưu trữ thời gian online lần gần nhất
const lastOnlineRef = db.ref('users/' + room + '/' + username + '/lastOnline');

/*.info/connected là giá trị boolean không đồng bộ với db vì nó sẽ lấy giá trị theo trạng thái của client.
                Tức là khi client đọc được file .info hay không và lấy giá trị*/
const connectedRef = db.ref('.info/connected');

connectedRef.on('value', function (snap) {
    // snap.val() gia tri false || true
    // true: user đang kết nối
    // onDisconnect() check xem thiet bi co ket noi hay khong?
    if (snap.val() == true) {
        const con = myConnectionsRef.push();

        // neu disconnect, thiet bi duoc remove
        con.onDisconnect().remove();

        // online set true: dang online
        con.set({"online": true});

        // Luu thoi gian gan nhat disconnect
        lastOnlineRef.onDisconnect().set(timestamp);
    }
});

// thanh status left
firebase.database().ref('users/' + room).on("value", function (data) {
    // value : toan bo gia tri tu user trở xuống
    // data bao gồm node, ref => dùng val() để get data
    // get key của value hiện tại là key của json tree dùng object.keys()
    const data1 = data.val();
    const data2 = Object.keys(data1);

    let i = 0;
    data2.forEach(function (value, index) {
        data2[index] = "<li>" + value + "</li>";
        firebase.database().ref("users/" + room + "/" + value + "/connections")
            .on('child_added', function (snapshot) {
                const online = snapshot.val();
                if (online.online == true) {
                    data2[index] = '<li>' + value + '<span aria-label="Đang hoạt động" class="span-status" </span></li>';
                    i++;
                }
            });
    });

    listUsers.innerHTML = data2.join('');
    userOnline.innerText = i + '/' + data2.length;
});

function getNumberPage(total, perPage) {
    return Math.ceil(total / perPage);
}

// Object.keys(data).length kiem tra Object co trong hay khong?
function getPage(page = 1, perPage = 5, totalRecord = 0) {
    if (page == 1) {
        return {page: 1, perPage};
    } else if (page > getNumberPage(totalRecord, perPage)) {
        return {page: getNumberPage(totalRecord, perPage) * perPage - perPage, perPage};
    } else {
        return {page: parseInt(page) * perPage - perPage, perPage};
    }
}

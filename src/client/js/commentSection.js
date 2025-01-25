const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

let deleteComments = document.querySelectorAll(".deleteComment");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".watch__comment ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "watch__comment-li";
  const icon = document.createElement("i");
  icon.className = "fa-regular fa-comment";
  const span = document.createElement("span");
  span.innerHTML = ` ${text}`;
  const span2 = document.createElement("span");
  span2.className = "fa-solid fa-trash-can deleteComment";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);

  // 새로 생성된 댓글 삭제 버튼에 이벤트 리스너 추가
  span2.addEventListener("click", handleDeleteComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const flimId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/flims/${flimId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    textarea.value = "";
    const json = await response.json();
    addComment(text, json.newCommentId);

    // 새로 생성된 댓글의 삭제 버튼 업데이트
    deleteComments = document.querySelectorAll(".deleteComment");
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

const handleDeleteComment = async (event) => {
  const li = event.target.closest("li");
  const { id: commentId } = li.dataset;
  const response = await fetch(`/api/comments/${commentId}/delete`, {
    method: "DELETE",
  });
  if (response.status === 200) {
    li.remove();
  }
};

// 페이지 로드 시 기존 삭제 버튼 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", () => {
  deleteComments = document.querySelectorAll(".deleteComment");
  deleteComments.forEach((deleteComment) => {
    deleteComment.addEventListener("click", handleDeleteComment);
  });
});

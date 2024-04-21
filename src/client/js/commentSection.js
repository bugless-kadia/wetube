const videoContainer = document.getElementById('videoContainer');
const form = document.getElementById('commentForm');
const deleteBtn = document.querySelectorAll('.deleteBtn');

const addComment = (text, id) => {
  const videoComments = document.querySelector('.video__comments ul');
  const newComment = document.createElement('li');
  newComment.dataset.id = id;
  newComment.className = 'video__comment';
  const icon = document.createElement('i');
  icon.className = 'fas fa-comment';
  const span = document.createElement('span');
  span.innerText = ` ${text}`;
  const span2 = document.createElement('span');
  span2.innerText = ' ❌';
  span2.className = 'deleteBtn';
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
  const newBtn = videoComments.querySelectorAll('.deleteBtn');
  newBtn.forEach((li) => li.addEventListener('click', handleCommentDelete));
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector('textarea');
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text.trim() === '') {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = '';
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

const handleCommentDelete = async (event) => {
  const commentId = event.target.parentElement.dataset.id;
  console.log('3', commentId);
  const videoId = videoContainer.dataset.id;
  const comment = event.target.parentElement;
  await fetch(`/api/videos/${commentId}/delete`, {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ videoId }),
  });
  comment.remove();
};

if (form) {
  form.addEventListener('submit', handleSubmit);
  deleteBtn.forEach((btn) =>
    btn.addEventListener('click', handleCommentDelete)
  );
}

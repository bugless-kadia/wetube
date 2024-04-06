import User from '../models/User';
import Video from '../models/Video';
import bcrypt from 'bcrypt';

export const getJoin = (req, res) =>
  res.render('users/join', { pageTitle: 'Join' });

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = 'Join';
  if (password !== password2) {
    return res.status(400).render('users/join', {
      pageTitle,
      errorMessage: 'Password confirmation does not match.',
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render('users/join', {
      pageTitle,
      errorMessage: 'This username/email is already taken.',
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect('/login');
  } catch (error) {
    return res.status(400).render('users/join', {
      errorMessage: 'error!',
    });
  }
};

export const getLogin = (req, res) => {
  return res.render('users/login', { pageTitle: 'Login' });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = 'Login';
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render('users/login', {
      pageTitle,
      errorMessage: 'An account with this username does not exists.',
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render('users/login', {
      pageTitle,
      errorMessage: 'Wrong password.',
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect('/');
};

// 1.사용자의 Github ID와 함께 요구사항 요청(GET)
export const startGithubLogin = (req, res) => {
  const baseUrl = 'https://github.com/login/oauth/authorize';
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: 'read:user user:email',
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  // 2.callback url에서 code를 포함한 parameter를 보내고(POST) access_token를 받음
  const baseUrl = 'https://github.com/login/oauth/access_token';
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
  ).json();
  // 3-1. access_token으로 Github API를 이용해 user 정보 가져오기
  if ('access_token' in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = 'https://api.github.com';
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    // 3-2. access_token으로 Github API를 이용해 email 정보 가져오기
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      // set notification
      return res.redirect('/login');
    }
    // 만약 해당 email을 가진 user가 없다면 계정 생성
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: '',
        socialOnly: true,
        location: '',
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect('/');
  } else {
    return res.redirect('/login');
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

export const getEdit = (req, res) => {
  return res.render('users/edit-profile', { pageTitle: 'Edit Profile' });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl, email: sessionEmail, username: sessionUsername },
    },
    body: { name, email, username, location },
    file,
  } = req;

  if (username !== sessionUsername) {
    const exists = await User.exists({ username });
    if (exists) {
      return res.status(400).render('users/edit-profile', {
        pageTitle: 'Edit Profile',
        errorMessage: 'This username is already taken.',
      });
    }
  }
  if (email !== sessionEmail) {
    const exists = await User.exists({ email });
    if (exists) {
      return res.status(400).render('users/edit-profile', {
        pageTitle: 'Edit Profile',
        errorMessage: 'This email is already taken.',
      });
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;

  return res.redirect('/users/edit');
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect('/');
  }
  return res.render('users/change-password', { pageTitle: 'Change Password' });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPassword2 },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render('users/change-password', {
      pageTitle: 'Change Password',
      errorMessage: 'The current password is incorrect',
    });
  }
  if (newPassword !== newPassword2) {
    return res.status(400).render('users/change-password', {
      pageTitle: 'Change Password',
      errorMessage: 'The password does not match the confirmation',
    });
  }
  user.password = newPassword;
  await user.save();
  return res.redirect('/users/logout');
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate('videos');
  if (!user) {
    return res.status(404).render('404', { pageTitle: 'User not found.' });
  }
  return res.render('users/profile', {
    pageTitle: user.name,
    user,
  });
};

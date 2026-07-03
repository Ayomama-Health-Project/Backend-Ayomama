import Account from "../../models/Account.js";
import CommunityPost from "../../models/CommunityPost.js";
import CommunityThread from "../../models/CommunityThread.js";
import HealthWorkerFollow from "../../models/HealthWorkerFollow.js";
import HealthWorkerProfile from "../../models/HealthWorkerProfile.js";
import MotherProfile from "../../models/MotherProfile.js";
import PartnerProfile from "../../models/PartnerProfile.js";
import { emitToRoom } from "../../realtime/socketServer.js";
import { sendProblem, sendSuccess } from "../../utils/problem.js";

async function getDisplayProfile(account) {
  if (!account) return { fullName: "AYOMAMA User", profilePicture: "" };

  if (account.role === "mother") {
    const profile = await MotherProfile.findOne({ account: account._id }).lean();
    return { fullName: profile?.fullName || account.email.split("@")[0], profilePicture: account.profilePicture || "" };
  }
  if (account.role === "partner") {
    const profile = await PartnerProfile.findOne({ account: account._id }).lean();
    return { fullName: profile?.fullName || account.email.split("@")[0], profilePicture: account.profilePicture || "" };
  }
  if (account.role === "health_worker") {
    const profile = await HealthWorkerProfile.findOne({ account: account._id }).lean();
    return {
      fullName: profile?.fullName || account.email.split("@")[0],
      occupation: profile?.occupation || "Health Worker",
      facilityName: profile?.facilityName || "",
      profilePicture: account.profilePicture || "",
      phoneNumber: profile?.phoneNumber || "",
      state: profile?.state || "",
      localGovernment: profile?.localGovernment || "",
    };
  }

  return { fullName: account.email.split("@")[0], profilePicture: account.profilePicture || "" };
}

async function buildDisplayProfileMap(accountIds) {
  const uniqueIds = [...new Set(accountIds.map((id) => String(id)).filter(Boolean))];
  const accounts = await Account.find({ _id: { $in: uniqueIds } }).lean();
  const profiles = await Promise.all(
    accounts.map(async (account) => [String(account._id), await getDisplayProfile(account)]),
  );
  return new Map(profiles);
}

async function mapPost(post, currentAccountId) {
  const authorAccount = await Account.findById(post.authorAccount).lean();
  const authorProfile = await getDisplayProfile(authorAccount);
  const displayProfileMap = await buildDisplayProfileMap(
    (post.comments || []).flatMap((comment) => [
      comment.authorAccount,
      ...(comment.replies || []).map((reply) => reply.authorAccount),
    ]),
  );

  return {
    id: String(post._id),
    author: {
      id: String(post.authorAccount),
      fullName: authorProfile.fullName,
      profilePicture: authorProfile.profilePicture,
    },
    content: post.content,
    likes: (post.likes || []).length,
    liked: (post.likes || []).some((id) => String(id) === String(currentAccountId)),
    comments: (post.comments || []).map((comment) => {
      const commentProfile = displayProfileMap.get(String(comment.authorAccount));
      return {
        id: String(comment._id),
        author: {
          id: String(comment.authorAccount),
          fullName: commentProfile?.fullName || "AYOMAMA User",
        },
        authorName: commentProfile?.fullName || "AYOMAMA User",
        content: comment.content,
        createdAt: comment.createdAt,
        replies: (comment.replies || []).map((reply) => {
          const replyProfile = displayProfileMap.get(String(reply.authorAccount));
          return {
            id: String(reply._id),
            authorName: replyProfile?.fullName || "AYOMAMA User",
            content: reply.content,
            createdAt: reply.createdAt,
          };
        }),
      };
    }),
    commentsCount: (post.comments || []).reduce(
      (count, comment) => count + 1 + ((comment.replies || []).length || 0),
      0,
    ),
    createdAt: post.createdAt,
  };
}

async function mapThread(thread, currentAccountId) {
  const otherParticipantId = thread.participantAccounts.find(
    (id) => String(id) !== String(currentAccountId),
  );
  const [otherAccount, targetWorker] = await Promise.all([
    otherParticipantId ? Account.findById(otherParticipantId).lean() : null,
    thread.targetHealthWorkerAccount
      ? Account.findById(thread.targetHealthWorkerAccount).lean()
      : null,
  ]);
  const displayAccount = otherAccount || targetWorker;
  const displayProfile = await getDisplayProfile(displayAccount);
  const latestMessage = thread.messages[thread.messages.length - 1];

  return {
    id: String(thread._id),
    title: thread.title || displayProfile.fullName || "Conversation",
    participantCount: thread.participantAccounts.length,
    preview: latestMessage?.content || "Tap to start your conversation.",
    latestMessageAt: latestMessage?.createdAt || thread.latestMessageAt || thread.createdAt,
    targetHealthWorkerAccount: thread.targetHealthWorkerAccount
      ? String(thread.targetHealthWorkerAccount)
      : null,
    participant: displayAccount
      ? {
          id: String(displayAccount._id),
          fullName: displayProfile.fullName,
          roleLabel:
            displayAccount.role === "health_worker"
              ? displayProfile.occupation || "Health Worker"
              : displayAccount.role,
          phoneNumber: displayProfile.phoneNumber || "",
          email: displayAccount.email,
          address:
            [displayProfile.localGovernment, displayProfile.state].filter(Boolean).join(", ") || "",
          profilePicture: displayProfile.profilePicture,
        }
      : null,
  };
}

export async function listCommunityPosts(req, res) {
  const posts = await CommunityPost.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const mapped = await Promise.all(posts.map((post) => mapPost(post, req.account._id)));
  return sendSuccess(res, {
    message: "Community posts loaded successfully.",
    data: mapped,
  });
}

export async function createCommunityPost(req, res) {
  const post = await CommunityPost.create({
    authorAccount: req.account._id,
    content: req.validated.body.content,
  });

  const mapped = await mapPost(post.toObject(), req.account._id);
  emitToRoom(`account:${req.account._id.toString()}`, "community:post.updated", mapped);

  return sendSuccess(res, {
    status: 201,
    message: "Community post created successfully.",
    data: mapped,
  });
}

export async function toggleCommunityPostLike(req, res) {
  const post = await CommunityPost.findById(req.params.postId);
  if (!post) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Post not found",
      status: 404,
      detail: "This community post could not be found.",
      errors: [{ field: "postId", code: "not_found" }],
    });
  }

  const existingIndex = post.likes.findIndex((id) => String(id) === String(req.account._id));
  if (existingIndex >= 0) {
    post.likes.splice(existingIndex, 1);
  } else {
    post.likes.push(req.account._id);
  }
  await post.save();

  const mapped = await mapPost(post.toObject(), req.account._id);
  return sendSuccess(res, {
    message: "Post reaction updated successfully.",
    data: mapped,
  });
}

export async function addCommunityComment(req, res) {
  const post = await CommunityPost.findById(req.params.postId);
  if (!post) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Post not found",
      status: 404,
      detail: "This community post could not be found.",
      errors: [{ field: "postId", code: "not_found" }],
    });
  }

  const { content, parentCommentId } = req.validated.body;
  if (parentCommentId) {
    const parent = post.comments.id(parentCommentId);
    if (!parent) {
      return sendProblem(res, req, {
        type: "/problems/not-found",
        title: "Comment not found",
        status: 404,
        detail: "The comment you want to reply to does not exist.",
        errors: [{ field: "parentCommentId", code: "not_found" }],
      });
    }
    parent.replies.push({
      authorAccount: req.account._id,
      content,
    });
  } else {
    post.comments.push({
      authorAccount: req.account._id,
      content,
    });
  }
  await post.save();

  const mapped = await mapPost(post.toObject(), req.account._id);
  return sendSuccess(res, {
    message: "Comment saved successfully.",
    data: mapped,
  });
}

export async function listCommunityThreads(req, res) {
  const threads = await CommunityThread.find({
    participantAccounts: req.account._id,
  })
    .sort({ latestMessageAt: -1, updatedAt: -1 })
    .limit(50)
    .lean();

  const mapped = await Promise.all(threads.map((thread) => mapThread(thread, req.account._id)));
  return sendSuccess(res, {
    message: "Message threads loaded successfully.",
    data: mapped,
  });
}

export async function createCommunityThread(req, res) {
  const { title, targetAccountId, content } = req.validated.body;
  const participantIds = [String(req.account._id)];
  if (targetAccountId) participantIds.push(String(targetAccountId));
  const uniqueParticipantIds = [...new Set(participantIds)];

  let thread = null;
  if (targetAccountId) {
    thread = await CommunityThread.findOne({
      participantAccounts: { $all: uniqueParticipantIds, $size: uniqueParticipantIds.length },
    });
  }

  if (!thread) {
    thread = await CommunityThread.create({
      title: title || "",
      participantAccounts: uniqueParticipantIds,
      targetHealthWorkerAccount: targetAccountId || null,
      messages: content
        ? [{ senderAccount: req.account._id, content }]
        : [],
      latestMessageAt: new Date(),
    });
  } else if (content) {
    thread.messages.push({ senderAccount: req.account._id, content });
    thread.latestMessageAt = new Date();
    if (!thread.title && title) thread.title = title;
    await thread.save();
  }

  const mapped = await mapThread(thread.toObject ? thread.toObject() : thread, req.account._id);
  return sendSuccess(res, {
    status: 201,
    message: "Message thread created successfully.",
    data: mapped,
  });
}

export async function listThreadMessages(req, res) {
  const thread = await CommunityThread.findById(req.params.threadId).lean();
  if (!thread || !thread.participantAccounts.some((id) => String(id) === String(req.account._id))) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Thread not found",
      status: 404,
      detail: "This conversation could not be found.",
      errors: [{ field: "threadId", code: "not_found" }],
    });
  }

  const senderAccounts = await Account.find({
    _id: { $in: thread.messages.map((message) => message.senderAccount) },
  }).lean();
  const senderMap = new Map(senderAccounts.map((account) => [String(account._id), account]));

  const messages = await Promise.all(
    thread.messages.map(async (message) => {
      const sender = senderMap.get(String(message.senderAccount));
      const profile = await getDisplayProfile(sender);
      return {
        id: String(message._id),
        role: String(message.senderAccount) === String(req.account._id) ? "user" : "assistant",
        senderName: profile.fullName,
        content: message.content,
        createdAt: message.createdAt,
      };
    }),
  );

  return sendSuccess(res, {
    message: "Thread messages loaded successfully.",
    data: messages,
  });
}

export async function createThreadMessage(req, res) {
  const thread = await CommunityThread.findById(req.params.threadId);
  if (!thread || !thread.participantAccounts.some((id) => String(id) === String(req.account._id))) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Thread not found",
      status: 404,
      detail: "This conversation could not be found.",
      errors: [{ field: "threadId", code: "not_found" }],
    });
  }

  thread.messages.push({
    senderAccount: req.account._id,
    content: req.validated.body.content,
  });
  thread.latestMessageAt = new Date();
  await thread.save();

  const savedMessage = thread.messages[thread.messages.length - 1];
  const profile = await getDisplayProfile(req.account);
  const payload = {
    id: String(savedMessage._id),
    role: "user",
    senderName: profile.fullName,
    content: savedMessage.content,
    createdAt: savedMessage.createdAt,
  };

  thread.participantAccounts.forEach((participantId) => {
    emitToRoom(`account:${participantId.toString()}`, "message:created", {
      threadId: String(thread._id),
      message: payload,
    });
  });

  return sendSuccess(res, {
    status: 201,
    message: "Message sent successfully.",
    data: payload,
  });
}

export async function listCommunityHealthWorkers(req, res) {
  const accounts = await Account.find({
    role: "health_worker",
    status: "active",
    onboardingCompleted: true,
  })
    .sort({ createdAt: -1 })
    .limit(24)
    .lean();
  const follows = await HealthWorkerFollow.find({ followerAccount: req.account._id }).lean();
  const followSet = new Set(follows.map((item) => String(item.healthWorkerAccount)));
  const profiles = await HealthWorkerProfile.find({
    account: { $in: accounts.map((account) => account._id) },
  }).lean();
  const profileMap = new Map(profiles.map((profile) => [String(profile.account), profile]));

  return sendSuccess(res, {
    message: "Health workers loaded successfully.",
    data: accounts.map((account) => {
      const profile = profileMap.get(String(account._id)) || {};
      return {
        id: String(account._id),
        fullName: profile.fullName || account.email.split("@")[0],
        role: profile.occupation || "Health Worker",
        email: account.email,
        phone: profile.phoneNumber || "",
        address: [profile.localGovernment, profile.state].filter(Boolean).join(", "),
        facilityName: profile.facilityName || "",
        following: followSet.has(String(account._id)),
        profilePicture: account.profilePicture || "",
      };
    }),
  });
}

export async function toggleHealthWorkerFollow(req, res) {
  const workerAccount = await Account.findOne({
    _id: req.params.workerId,
    role: "health_worker",
    status: "active",
  }).lean();
  if (!workerAccount) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Health worker not found",
      status: 404,
      detail: "This health worker could not be found.",
      errors: [{ field: "workerId", code: "not_found" }],
    });
  }

  const existing = await HealthWorkerFollow.findOne({
    followerAccount: req.account._id,
    healthWorkerAccount: workerAccount._id,
  });

  if (existing) {
    await existing.deleteOne();
  } else {
    await HealthWorkerFollow.create({
      followerAccount: req.account._id,
      healthWorkerAccount: workerAccount._id,
    });
  }

  return sendSuccess(res, {
    message: "Health worker follow state updated successfully.",
    data: {
      workerId: String(workerAccount._id),
      following: !existing,
    },
  });
}

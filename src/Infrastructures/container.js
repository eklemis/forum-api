/* istanbul ignore file */

const { createContainer } = require("instances-container");

// external agency
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const Jwt = require("@hapi/jwt");
const pool = require("./database/postgres/pool");

// service (repository, helper, manager, etc)
const UserRepository = require("../Domains/users/UserRepository");
const PasswordHash = require("../Applications/security/PasswordHash");
const UserRepositoryPostgres = require("./repository/UserRepositoryPostgres");
const BcryptPasswordHash = require("./security/BcryptPasswordHash");

// use case
const AddUserUseCase = require("../Applications/use_case/AddUserUseCase");
const AuthenticationTokenManager = require("../Applications/security/AuthenticationTokenManager");
const JwtTokenManager = require("./security/JwtTokenManager");
const LoginUserUseCase = require("../Applications/use_case/LoginUserUseCase");
const AuthenticationRepository = require("../Domains/authentications/AuthenticationRepository");
const AuthenticationRepositoryPostgres = require("./repository/AuthenticationRepositoryPostgres");
const LogoutUserUseCase = require("../Applications/use_case/LogoutUserUseCase");
const RefreshAuthenticationUseCase = require("../Applications/use_case/RefreshAuthenticationUseCase");
const ThreadRepositoryPostgres = require("./repository/ThreadRepositoryPostgres");
const AddThreadUseCase = require("../Applications/use_case/AddThreadUseCase");
const AddCommentUseCase = require("../Applications/use_case/AddCommentUseCase");
const CommentRepositoryPostgres = require("./repository/CommentRepositoryPostgres");
const DeleteCommentUseCase = require("../Applications/use_case/DeleteCommentUseCase");
const GetThreadDetailUseCase = require("../Applications/use_case/GetThreadDetailUseCase");
const ReplyRepositoryPostgres = require("./repository/ReplyRepositoryPostgres");
const AddReplyUseCase = require("../Applications/use_case/AddReplyUseCase");
const DeleteReplyUseCase = require("../Applications/use_case/DeleteReplyUseCase");
const ToggleCommentLikeUseCase = require("../Applications/use_case/ToggleCommentLikeUseCase");

// creating container
const container = createContainer();

// registering services and repository
container.register([
  {
    key: CommentRepositoryPostgres.name,
    Class: CommentRepositoryPostgres,
    parameter: {
      dependencies: [
        { concrete: pool }, // Directly use the pool instance
        { concrete: nanoid }, // Directly use nanoid for ID generation
      ],
    },
  },
  {
    key: ThreadRepositoryPostgres.name,
    Class: ThreadRepositoryPostgres,
    parameter: {
      dependencies: [{ concrete: pool }],
    },
  },
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: AuthenticationRepository.name,
    Class: AuthenticationRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
      ],
    },
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt,
        },
      ],
    },
  },
  {
    key: AuthenticationTokenManager.name,
    Class: JwtTokenManager,
    parameter: {
      dependencies: [
        {
          concrete: Jwt.token,
        },
      ],
    },
  },
  {
    key: ThreadRepositoryPostgres.name,
    Class: ThreadRepositoryPostgres,
    parameter: {
      dependencies: [
        { concrete: pool }, // Database pool dependency
        { concrete: nanoid }, // ID generator dependency
      ],
    },
  },
  {
    key: ReplyRepositoryPostgres.name,
    Class: ReplyRepositoryPostgres,
    parameter: {
      dependencies: [{ concrete: pool }, { concrete: nanoid }],
    },
  },
]);

// registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "userRepository",
          internal: UserRepository.name,
        },
        {
          name: "passwordHash",
          internal: PasswordHash.name,
        },
      ],
    },
  },
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "userRepository",
          internal: UserRepository.name,
        },
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
        {
          name: "authenticationTokenManager",
          internal: AuthenticationTokenManager.name,
        },
        {
          name: "passwordHash",
          internal: PasswordHash.name,
        },
      ],
    },
  },
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
      ],
    },
  },
  {
    key: RefreshAuthenticationUseCase.name,
    Class: RefreshAuthenticationUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
        {
          name: "authenticationTokenManager",
          internal: AuthenticationTokenManager.name,
        },
      ],
    },
  },
  {
    key: AddThreadUseCase.name, // Key should match `AddThreadUseCase.name`
    Class: AddThreadUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        { name: "threadRepository", internal: ThreadRepositoryPostgres.name },
      ],
    },
  },
  {
    key: AddCommentUseCase.name,
    Class: AddCommentUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        { name: "commentRepository", internal: CommentRepositoryPostgres.name },
        { name: "threadRepository", internal: ThreadRepositoryPostgres.name },
      ],
    },
  },
  {
    key: DeleteCommentUseCase.name,
    Class: DeleteCommentUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        { name: "commentRepository", internal: CommentRepositoryPostgres.name },
        { name: "threadRepository", internal: ThreadRepositoryPostgres.name },
      ],
    },
  },
  {
    key: GetThreadDetailUseCase.name, // Register GetThreadDetailUseCase
    Class: GetThreadDetailUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        { name: "threadRepository", internal: ThreadRepositoryPostgres.name },
        { name: "commentRepository", internal: CommentRepositoryPostgres.name },
        { name: "replyRepository", internal: ReplyRepositoryPostgres.name },
      ],
    },
  },
  {
    key: AddReplyUseCase.name,
    Class: AddReplyUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        { name: "replyRepository", internal: ReplyRepositoryPostgres.name },
        { name: "commentRepository", internal: CommentRepositoryPostgres.name },
        { name: "threadRepository", internal: ThreadRepositoryPostgres.name },
      ],
    },
  },
  {
    key: DeleteReplyUseCase.name,
    Class: DeleteReplyUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        { name: "replyRepository", internal: ReplyRepositoryPostgres.name },
        { name: "commentRepository", internal: CommentRepositoryPostgres.name },
        { name: "threadRepository", internal: ThreadRepositoryPostgres.name },
      ],
    },
  },
  {
    key: ToggleCommentLikeUseCase.name,
    Class: ToggleCommentLikeUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        { name: "commentRepository", internal: CommentRepositoryPostgres.name },
        { name: "threadRepository", internal: ThreadRepositoryPostgres.name },
      ],
    },
  },
]);

module.exports = container;

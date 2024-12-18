const InvariantError = require("./InvariantError");
const AuthorizationError = require("./AuthorizationError");
const NotFoundError = require("./NotFoundError");

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  "REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada",
  ),
  "REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat user baru karena tipe data tidak sesuai",
  ),
  "REGISTER_USER.USERNAME_LIMIT_CHAR": new InvariantError(
    "tidak dapat membuat user baru karena karakter username melebihi batas limit",
  ),
  "REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER": new InvariantError(
    "tidak dapat membuat user baru karena username mengandung karakter terlarang",
  ),
  "USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "harus mengirimkan username dan password",
  ),
  "USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "username dan password harus string",
  ),
  "REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN":
    new InvariantError("harus mengirimkan token refresh"),
  "REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION":
    new InvariantError("refresh token harus string"),
  "DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN":
    new InvariantError("harus mengirimkan token refresh"),
  "DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION":
    new InvariantError("refresh token harus string"),

  // AddThreadUseCase errors
  "ADD_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada",
  ),
  "ADD_THREAD_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat thread baru karena tipe data tidak sesuai",
  ),

  // AddCommentUseCase errors
  "ADD_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat menambahkan komentar baru karena properti yang dibutuhkan tidak ada",
  ),
  "ADD_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat menambahkan komentar baru karena tipe data tidak sesuai",
  ),

  // DeleteCommentUseCase errors
  "DELETE_COMMENT_USE_CASE.THREAD_NOT_FOUND": new NotFoundError(
    "thread yang diminta tidak ditemukan",
  ),
  "DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND": new NotFoundError(
    "komentar yang diminta tidak ditemukan",
  ),
  "DELETE_COMMENT_USE_CASE.NOT_AUTHORIZED": new AuthorizationError(
    "anda tidak berhak menghapus komentar ini",
  ),

  "THREAD_REPOSITORY.THREAD_NOT_FOUND": new NotFoundError(
    "thread yang diminta tidak ditemukan",
  ),
};

module.exports = DomainErrorTranslator;

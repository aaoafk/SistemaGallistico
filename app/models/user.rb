class User < ApplicationRecord
  has_many :gallos
  has_secure_password
end

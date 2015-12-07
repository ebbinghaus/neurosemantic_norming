from psiturk.db import Base, db_session, init_db
from sqlalchemy import or_, Column, Integer, String, DateTime, Boolean, Float, Text, ForeignKey
from sqlalchemy.orm import relationship, backref



# class Pixels(Base):
# """
# Object representation of a participant in the database.
# """
# __tablename__ = 'pixels'
# index = Column(Integer, primary_key=True, unique=True)
# filename = Column(String(128))
# n_completed = Column(Integer)
# width = Column(Integer)
# height = Column(Integer)
# illustrations = Column(Text(4294967295)) # where to put the data from people


class Word(Base):
	"""
	DB for words, their definition, and the total rating counts across features for each word
	"""
	__tablename__ = 'krns_feature_rating_v1_words'
	index = Column(Integer, primary_key=True, unique=True)
	word_string = Column(String(128), unique=True)
	word_definition = Column(Text(4294967295))
	rating_count = Column(Integer)
	ratings = relationship("Rating", backref="word")

	def __init__(self):
		self.rating_count = 0


class Feature(Base):
	"""
	DB for features and the total rating counts across words for each feature
	"""
	__tablename__ = 'krns_feature_rating_v1_features'
	index = Column(Integer, primary_key=True, unique=True)
	feature_string = Column(Text(4294967295))
	rating_count = Column(Integer)
	ratings = relationship("Rating", backref="feature")

	def __init__(self):
		self.rating_count = 0


# class WordXFeature(Base):
# 	"""
# 	DB for storing the wordXfeature combinations
# 	"""
# 	__tablename__ = 'wordxfeature'
# 	index = Column(Integer, primary_key=True, unique=True)
# 	word_id = Column(Integer)
# 		wordname = Column(String(128))
# 	feature_id = Column(Integer)
# 	feature = Column(Text(4294967295))
# 	rating_count = Column(Integer)


class Rating(Base):
	"""
	DB for storing the wordXfeature combinations
	"""
	__tablename__ = 'krns_feature_rating_v1_ratings'
	index = Column(Integer, primary_key=True, unique=True)
	word_string = Column(String(128))
	feature_string = Column(Text(4294967295))
	subject_id = Column(String(128)) 
	rating = Column(Float)
	word_id = Column(Integer,ForeignKey('krns_feature_rating_v1_words.index'))
	feature_id = Column(Integer,ForeignKey('krns_feature_rating_v1_features.index'))

	def __init__(self, word, feature, subject_id):
		self.word = word
		self.feature = feature
		self.word_string = word.word_string
		self.feature_string = feature.feature_string
		self.subject_id = subject_id
		self.rating = 0

	def set_rating(self, rating):
		self.rating = rating
		self.word.rating_count+=1
		self.feature.rating_count+=1

	# def set_word(self, myword):
	# 	self.word = myword
	# 	self.wordname = myword.wordname

# import image_slicer
import os
import csv
from psiturk.db import db_session, init_db, Base
from custom_models import Word, Feature, Rating

init_db() # initialze the data base, creating tables for the custom_models.py if necessary


# read in the words, definitions, and feature strings
with open('./stims/amt_unique_words.csv', 'rb') as f:
    amt_words = list(tuple(rec) for rec in csv.reader(f, delimiter='\t'))

with open('./stims/amt_unique_defs.csv', 'rb') as f:
    amt_defs = list(tuple(rec) for rec in csv.reader(f, delimiter='\t'))

with open('./stims/amt_feats.csv', 'rb') as f:
    amt_feats = list(tuple(rec) for rec in csv.reader(f, delimiter='\t'))


# populate words table with words and definitions
for idx in range(len(amt_words[0])):
	word=Word()
	word.word_string=amt_words[0][idx]
	word.word_definition=amt_defs[0][idx]
	db_session.add(word)
db_session.commit()


# put features in the feature table
for cfeat in amt_feats[0]:
	feature=Feature()
	feature.feature_string=cfeat
	db_session.add(feature)
db_session.commit()



# rating=Rating(word, feature)
# rating.set_rating(98)
# db_session.add(rating)


db_session.commit()
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {api} from '../config/api';

const ReviewsScreen = ({route, navigation}) => {
  const {userId, userName, listingId} = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [userId]);

  const loadReviews = async () => {
    try {
      const data = await api.getUserReviews(userId);
      setReviews(data);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Ошибка', 'Напишите комментарий');
      return;
    }

    setSubmitting(true);
    try {
      await api.addReview({
        reviewed_id: userId,
        listing_id: listingId,
        rating,
        comment: comment.trim(),
      });

      Alert.alert('Успешно', 'Отзыв добавлен');
      setShowAddReview(false);
      setComment('');
      setRating(5);
      loadReviews();
    } catch (error) {
      Alert.alert('Ошибка', error.message || 'Не удалось добавить отзыв');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count, interactive = false, onPress = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onPress && onPress(star)}
            disabled={!interactive}>
            <Ionicons
              name={star <= count ? 'star' : 'star-outline'}
              size={interactive ? 32 : 16}
              color="#fbbf24"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Отзывы</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView>
        <View style={styles.summaryCard}>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.averageRating}>{calculateAverageRating()}</Text>
            {renderStars(Math.round(calculateAverageRating()))}
            <Text style={styles.reviewCount}>({reviews.length})</Text>
          </View>
          {listingId && (
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={() => setShowAddReview(!showAddReview)}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addReviewButtonText}>Оставить отзыв</Text>
            </TouchableOpacity>
          )}
        </View>

        {showAddReview && (
          <View style={styles.addReviewCard}>
            <Text style={styles.addReviewTitle}>Ваш отзыв</Text>
            <Text style={styles.label}>Оценка</Text>
            {renderStars(rating, true, setRating)}
            <Text style={styles.label}>Комментарий</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Расскажите о вашем опыте..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddReview(false)}>
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitReview}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Отправить</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>Пока нет отзывов</Text>
            <Text style={styles.emptySubtext}>Будьте первым!</Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <View style={styles.reviewerAvatar}>
                    <Ionicons name="person" size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString('ru-RU')}
                    </Text>
                  </View>
                </View>
                {renderStars(review.rating)}
              </View>
              {review.listing_title && (
                <Text style={styles.listingTitle}>
                  Объявление: {review.listing_title}
                </Text>
              )}
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addReviewButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  addReviewCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addReviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  listingTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});

export default ReviewsScreen;

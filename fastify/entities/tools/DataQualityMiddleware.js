import EnseignementUnit from '../EnseignementUnit.js';
import Milestone from '../Milestone.js';
import Promotion from '../Promotion.js';
import Template from '../Template.js';
import User from '../User.js';

export default class DataQualityMiddleware {
  static async assertEnseignementUnitIdExists(request) {
    const { EnseignementUnitId: enseignementUnitId } = request.params;

    if (!(await EnseignementUnit.isIdInserted(enseignementUnitId))) {
      throw { statusCode: 404, error: 'UNKNOWN_ENSEIGNEMENT_UNIT_ID' };
    }
  }

  static async assertMilestoneIdExists(request) {
    const { MilestoneId: milestoneId } = request.params;

    if (!(await Milestone.isIdInserted(milestoneId))) {
      throw { statusCode: 404, error: 'UNKNOWN_MILESTONE_ID' };
    }
  }

  static async assertPromotionIdExists(request) {
    const { PromotionId: promotionId } = request.params;

    if (!(await Promotion.isIdInserted(promotionId))) {
      throw { statusCode: 404, error: 'UNKNOWN_PROMOTION_ID' };
    }
  }

  static async assertTemplateIdExists(request) {
    const { TemplateId: templateId } = request.params;

    if (!(await Template.isIdInserted(templateId))) {
      throw { statusCode: 404, error: 'UNKNOWN_TEMPLATE_ID' };
    }
  }

  static async assertUserIdExists(request) {
    const { UserId: userId } = request.params;

    if (!(await User.isIdInserted(userId))) {
      throw { statusCode: 404, error: 'UNKNOWN_USER_ID' };
    }
  }

  static async assertTemplateIdAndMilestoneIdMatch(request) {
    const { TemplateId: templateId, MilestoneId: milestoneId } = request.params;

    const milestone = await Milestone.fromId(milestoneId);

    if (templateId !== milestone.Template.Id) {
      throw { statusCode: 409, error: 'TEMPLATE_ID_MISMATCH' };
    }
  }
}

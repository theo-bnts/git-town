import EnseignementUnit from '../EnseignementUnit.js';
import Milestone from '../Milestone.js';
import Promotion from '../Promotion.js';
import Repository from '../Repository.js';
import Template from '../Template.js';
import Token from '../Token.js';
import User from '../User.js';

export default class ParametersMiddleware {
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

  static async assertRepositoryIdExists(request) {
    const { RepositoryId: repositoryId } = request.params;

    if (!(await Repository.isIdInserted(repositoryId))) {
      throw { statusCode: 404, error: 'UNKNOWN_REPOSITORY_ID' };
    }
  }

  static async assertTemplateIdExists(request) {
    const { TemplateId: templateId } = request.params;

    if (!(await Template.isIdInserted(templateId))) {
      throw { statusCode: 404, error: 'UNKNOWN_TEMPLATE_ID' };
    }
  }

  static async assertTokenIdExists(request) {
    const { TokenId: tokenId } = request.params;

    if (!(await Token.isIdInserted(tokenId))) {
      throw { statusCode: 404, error: 'UNKNOWN_TOKEN_ID' };
    }
  }

  static async assertUserIdExists(request) {
    const { UserId: userId } = request.params;

    if (!(await User.isIdInserted(userId))) {
      throw { statusCode: 404, error: 'UNKNOWN_USER_ID' };
    }
  }

  static async assertUserIdAndTokenIdMatch(request) {
    const { UserId: userId, TokenId: tokenId } = request.params;

    const token = await Token.fromId(tokenId);

    if (userId !== token.User.Id) {
      throw { statusCode: 409, error: 'USER_ID_MISMATCH' };
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
